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
import { triggerLogout } from "./auth-helpers";

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

function triggerSilentLogout(reason: string): void {
  triggerLogout(window.location.origin, reason);
}

const NETWORK_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 8000,
};

const createTimedSignal = (timeoutMs: number, externalSignal?: AbortSignal) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    // Provide a clear timeout reason instead of generic "failed to fetch"
    controller.abort(
      new DOMException(`Request timeout after ${timeoutMs}ms`, "TimeoutError"),
    );
  }, timeoutMs);

  return {
    signal: externalSignal
      ? AbortSignal.any([externalSignal, controller.signal])
      : controller.signal,
    dispose: () => clearTimeout(timeoutId),
  };
};

const logForbiddenRetry = (url: string, status: "pending" | "succeeded") => {
  const message =
    status === "pending"
      ? `403 Forbidden from ${url} - attempting token refresh`
      : `403 Forbidden from ${url} - recovered via token refresh`;

  reportApiError(new Error(message), {
    operation: "fetchWithAuth",
    component: "http-client",
    url,
    additionalData: {
      statusCode: 403,
      retryAttempt: status,
    },
    skipNotification: true,
  });
};

/**
 * Creates a request executor with timeout
 */
function createRequestExecutor(
  url: string,
  fetchOptions: Omit<RequestInit, "headers">,
  requestHeaders: Record<string, string>,
  timeoutMs: number,
) {
  return async (externalSignal?: AbortSignal): Promise<Response> => {
    const { signal, dispose } = createTimedSignal(timeoutMs, externalSignal);
    try {
      return await fetchWithRetry(
        url,
        {
          ...fetchOptions,
          headers: requestHeaders,
          signal,
        },
        NETWORK_RETRY_CONFIG,
      );
    } finally {
      dispose();
    }
  };
}

/**
 * Handles errors from fetch requests
 */
function handleFetchError(error: unknown, url: string): never {
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

/**
 * Processes response and handles 403 retry if needed
 */
async function processResponse(
  response: Response,
  skip403Retry: boolean,
  url: string,
  getToken: TokenGetter,
  executeRequest: (signal?: AbortSignal) => Promise<Response>,
  requestHeaders: Record<string, string>,
  signal?: AbortSignal,
): Promise<Response> {
  if (response.status === 403 && !skip403Retry) {
    return await handle403Response(
      url,
      getToken,
      executeRequest,
      requestHeaders,
      signal,
    );
  }

  return response;
}

/**
 * Fetches authentication token if not skipping auth
 */
async function getAuthToken(
  getToken: TokenGetter,
  skipAuth: boolean,
): Promise<string | null> {
  if (skipAuth) {
    return null;
  }

  try {
    return await getToken();
  } catch (error) {
    reportAuthError(error as Error, {
      operation: "getToken",
      component: "http-client",
    });
    throw error;
  }
}

/**
 * Handles 403 response by refreshing token and retrying request
 */
async function handle403Response(
  url: string,
  getToken: TokenGetter,
  executeRequest: (signal?: AbortSignal) => Promise<Response>,
  requestHeaders: Record<string, string>,
  signal?: AbortSignal,
): Promise<Response> {
  logForbiddenRetry(url, "pending");

  try {
    const newToken = await getToken();
    requestHeaders.Authorization = `Bearer ${newToken}`;

    const retryResponse = await executeRequest(signal);

    if (retryResponse.status === 403) {
      triggerSilentLogout("403 Forbidden persisted after token refresh");
      throw new ForbiddenError(
        "Access denied after token refresh",
        retryResponse,
      );
    }

    logForbiddenRetry(url, "succeeded");
    return retryResponse;
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw error;
    }
    triggerSilentLogout("Token refresh failed on 403 error");
    throw new ForbiddenError("Failed to refresh token after 403 error");
  }
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
    timeoutMs = 30000,
    headers = {},
    ...fetchOptions
  } = options;

  const requestHeaders: Record<string, string> = { ...headers };

  const token = await getAuthToken(getToken, skipAuth);
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const executeRequest = createRequestExecutor(
    url,
    fetchOptions,
    requestHeaders,
    timeoutMs,
  );

  try {
    const response = await executeRequest(fetchOptions.signal ?? undefined);

    return await processResponse(
      response,
      skip403Retry,
      url,
      getToken,
      executeRequest,
      requestHeaders,
      fetchOptions.signal ?? undefined,
    );
  } catch (error) {
    return handleFetchError(error, url);
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
        authorizationParams: env.AUTH0_AUDIENCE
          ? { audience: env.AUTH0_AUDIENCE }
          : {},
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
