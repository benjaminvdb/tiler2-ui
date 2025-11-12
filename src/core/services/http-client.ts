/**
 * HTTP client with automatic authentication and 403 error handling.
 * Uses Auth0 SDK for token management, retries on 403 with token refresh,
 * and triggers logout when authentication fails.
 */

import { reportApiError, reportAuthError } from "./observability";
import { fetchWithRetry } from "@/shared/utils/retry";
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";
import { env } from "@/env";

interface FetchWithAuthOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  /** Skip automatic token fetching for public endpoints */
  skipAuth?: boolean;
  /** Skip automatic 403 retry for special cases */
  skip403Retry?: boolean;
  /** Timeout in milliseconds (default: 10000ms = 10 seconds) */
  timeoutMs?: number;
}

type TokenGetter = () => Promise<string>;

export class ForbiddenError extends Error {
  constructor(
    message = "You don't have permission to access this resource",
    public readonly originalResponse?: Response,
  ) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function isForbiddenError(error: unknown): error is ForbiddenError {
  return error instanceof Error && error.name === "ForbiddenError";
}

function triggerSilentLogout(reason: string): void {
  reportAuthError(new Error(`Silent logout triggered: ${reason}`), {
    operation: "silentLogout",
    component: "http-client",
    additionalData: {
      severity: "high",
      reason,
    },
  });

  window.location.href = "/api/auth/logout";
}

/**
 * Fetch wrapper with automatic authentication and 403 error handling.
 * Automatically includes auth tokens and retries once on 403 with token refresh.
 *
 * @param getToken - Function to retrieve access token
 * @throws {ForbiddenError} When 403 persists after token refresh
 * @example
 * const response = await fetchWithAuth(getToken, '/api/data');
 * const data = await response.json();
 */
export async function fetchWithAuth(
  getToken: TokenGetter,
  url: string,
  options: FetchWithAuthOptions = {},
): Promise<Response> {
  const {
    skipAuth = false,
    skip403Retry = false,
    timeoutMs = 10000,
    headers = {},
    ...fetchOptions
  } = options;

  const requestHeaders: Record<string, string> = { ...headers };

  if (!skipAuth) {
    try {
      const token = await getToken();
      requestHeaders.Authorization = `Bearer ${token}`;
    } catch (error) {
      reportAuthError(error as Error, {
        operation: "getToken",
        component: "http-client",
      });
      throw error;
    }
  }

  // Create timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  try {
    // Combine timeout signal with any existing signal
    const combinedSignal = fetchOptions.signal
      ? AbortSignal.any([fetchOptions.signal, timeoutController.signal])
      : timeoutController.signal;

    // Use retry logic for network resilience (3 retries with 1s base delay)
    const response = await fetchWithRetry(
      url,
      {
        ...fetchOptions,
        headers: requestHeaders,
        signal: combinedSignal,
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 8000,
      },
    );

    if (response.status === 403 && !skip403Retry) {
      /**
       * Log 403 to Sentry for monitoring, but suppress user notification since
       * we're about to attempt automatic recovery via token refresh.
       * Toast will only show if retry fails.
       */
      reportApiError(
        new Error(`403 Forbidden from ${url} - attempting token refresh`),
        {
          operation: "fetchWithAuth",
          component: "http-client",
          url,
          additionalData: {
            statusCode: 403,
            retryAttempt: "pending",
          },
          skipNotification: true,
        },
      );

      try {
        const newToken = await getToken();
        requestHeaders.Authorization = `Bearer ${newToken}`;

        // Create new timeout controller for retry attempt
        const retryTimeoutController = new AbortController();
        const retryTimeoutId = setTimeout(
          () => retryTimeoutController.abort(),
          timeoutMs,
        );

        try {
          // Combine timeout signal with any existing signal for retry
          const retryCombinedSignal = fetchOptions.signal
            ? AbortSignal.any([
                fetchOptions.signal,
                retryTimeoutController.signal,
              ])
            : retryTimeoutController.signal;

          // Use retry logic for the 403 retry attempt as well
          const retryResponse = await fetchWithRetry(
            url,
            {
              ...fetchOptions,
              headers: requestHeaders,
              signal: retryCombinedSignal,
            },
            {
              maxRetries: 3,
              baseDelay: 1000,
              maxDelay: 8000,
            },
          );

          if (retryResponse.status === 403) {
            /**
             * Token refresh succeeded but still got 403 - user truly lacks permission.
             * Show error toast and logout via triggerSilentLogout.
             */
            triggerSilentLogout("403 Forbidden persisted after token refresh");
            throw new ForbiddenError(
              "Access denied after token refresh",
              retryResponse,
            );
          }

          /**
           * Retry succeeded - log success to Sentry for monitoring.
           * No user notification needed since operation completed successfully.
           */
          reportApiError(
            new Error(
              `403 Forbidden from ${url} - recovered via token refresh`,
            ),
            {
              operation: "fetchWithAuth",
              component: "http-client",
              url,
              additionalData: {
                statusCode: 403,
                retryAttempt: "succeeded",
              },
              skipNotification: true,
            },
          );

          return retryResponse;
        } finally {
          clearTimeout(retryTimeoutId);
        }
      } catch (error) {
        if (error instanceof ForbiddenError) {
          throw error;
        }
        /**
         * Token refresh itself failed - show error toast and logout.
         * User needs to know authentication failed.
         */
        triggerSilentLogout("Token refresh failed on 403 error");
        throw new ForbiddenError(
          "Failed to refresh token after 403 error",
          response,
        );
      }
    }

    return response;
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw error;
    }

    reportApiError(error as Error, {
      operation: "fetchWithAuth",
      component: "http-client",
      url,
    });

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * React hook that returns the authenticated fetch function with automatic token management.
 * Uses Auth0 SDK to fetch access tokens automatically.
 * @example
 * const fetch = useAuthenticatedFetch();
 * const response = await fetch('/api/data');
 */
export function useAuthenticatedFetch() {
  const { getAccessTokenSilently } = useAuth0();

  const getToken = useCallback(async (): Promise<string> => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: env.AUTH0_AUDIENCE,
        },
      });
      return token;
    } catch (error) {
      reportAuthError(error as Error, {
        operation: "getAccessTokenSilently",
        component: "useAuthenticatedFetch",
      });
      throw error;
    }
  }, [getAccessTokenSilently]);

  return useCallback(
    (url: string, options?: FetchWithAuthOptions) =>
      fetchWithAuth(getToken, url, options),
    [getToken],
  );
}
