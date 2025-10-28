/**
 * HTTP client with automatic authentication and 403 error handling.
 * Fetches auth tokens automatically, retries on 403 with token refresh,
 * and triggers logout when authentication fails.
 */

import { reportApiError, reportAuthError } from "./error-reporting";

interface FetchWithAuthOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  /** Skip automatic token fetching for public endpoints */
  skipAuth?: boolean;
  /** Skip automatic 403 retry for special cases */
  skip403Retry?: boolean;
}

interface TokenResponse {
  token: string;
  expiresAt?: number;
}

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

async function fetchAccessToken(): Promise<string> {
  try {
    const response = await fetch("/api/auth/token");

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/api/auth/login";
        throw new Error("Session expired, redirecting to login");
      }

      if (response.status === 403) {
        window.location.href = "/api/auth/logout";
        throw new Error("Access denied, logging out");
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Token fetch failed: ${response.status}`,
      );
    }

    const data: TokenResponse = await response.json();
    return data.token;
  } catch (error) {
    reportAuthError(error as Error, {
      operation: "fetchAccessToken",
      component: "http-client",
    });
    throw error;
  }
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
 * @throws {ForbiddenError} When 403 persists after token refresh
 * @example
 * const response = await fetchWithAuth('/api/data');
 * const data = await response.json();
 */
export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {},
): Promise<Response> {
  const {
    skipAuth = false,
    skip403Retry = false,
    headers = {},
    ...fetchOptions
  } = options;

  const requestHeaders: Record<string, string> = { ...headers };

  if (!skipAuth) {
    const token = await fetchAccessToken();
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

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
        const newToken = await fetchAccessToken();
        requestHeaders.Authorization = `Bearer ${newToken}`;

        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: requestHeaders,
        });

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
          new Error(`403 Forbidden from ${url} - recovered via token refresh`),
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
  }
}

/**
 * React hook that returns the authenticated fetch function.
 * @example
 * const fetch = useAuthenticatedFetch();
 * const response = await fetch('/api/data');
 */
export function useAuthenticatedFetch() {
  return fetchWithAuth;
}
