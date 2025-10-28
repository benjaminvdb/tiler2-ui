/**
 * HTTP Client with automatic authentication and 403 error handling
 *
 * Provides a fetch wrapper that:
 * - Automatically fetches and includes auth tokens
 * - Handles 403 Forbidden errors with token refresh retry
 * - Logs out users when token refresh fails
 * - Reports errors to Sentry with proper context
 */

import { reportApiError, reportAuthError } from "./error-reporting";

/**
 * Configuration for fetchWithAuth
 */
interface FetchWithAuthOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  /**
   * Skip automatic token fetching (for endpoints that don't need auth)
   */
  skipAuth?: boolean;
  /**
   * Skip automatic 403 retry (for special cases)
   */
  skip403Retry?: boolean;
}

/**
 * Result from token fetch endpoint
 */
interface TokenResponse {
  token: string;
  expiresAt?: number;
}

/**
 * Error thrown when 403 handling fails
 */
export class ForbiddenError extends Error {
  constructor(
    message = "You don't have permission to access this resource",
    public readonly originalResponse?: Response,
  ) {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Check if an error is a ForbiddenError
 */
export function isForbiddenError(error: unknown): error is ForbiddenError {
  return error instanceof Error && error.name === "ForbiddenError";
}

/**
 * Fetch access token from the auth endpoint
 */
async function fetchAccessToken(): Promise<string> {
  try {
    const response = await fetch("/api/auth/token");

    if (!response.ok) {
      if (response.status === 401) {
        // Session expired - redirect to login
        window.location.href = "/api/auth/login";
        throw new Error("Session expired, redirecting to login");
      }

      if (response.status === 403) {
        // Permission denied at token level - logout immediately
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
    // Report token fetch errors as auth errors
    reportAuthError(error as Error, {
      operation: "fetchAccessToken",
      component: "http-client",
    });
    throw error;
  }
}

/**
 * Trigger silent logout by redirecting to the logout endpoint
 */
function triggerSilentLogout(reason: string): void {
  // Report logout to Sentry for tracking
  reportAuthError(new Error(`Silent logout triggered: ${reason}`), {
    operation: "silentLogout",
    component: "http-client",
    additionalData: {
      severity: "high",
      reason,
    },
  });

  // Redirect to Auth0 logout endpoint
  // This will clear the session and redirect to the login page
  window.location.href = "/api/auth/logout";
}

/**
 * Enhanced fetch with automatic authentication and 403 handling
 *
 * @param url - The URL to fetch
 * @param options - Fetch options with auth configuration
 * @returns Promise resolving to Response
 *
 * @throws {ForbiddenError} When 403 persists after retry
 * @throws {Error} For other fetch errors
 *
 * @example
 * ```typescript
 * // Simple authenticated GET
 * const response = await fetchWithAuth('https://api.example.com/data');
 * const data = await response.json();
 *
 * // POST with body
 * const response = await fetchWithAuth('https://api.example.com/create', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ name: 'test' })
 * });
 *
 * // Skip authentication
 * const response = await fetchWithAuth('https://api.example.com/public', {
 *   skipAuth: true
 * });
 * ```
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

  // Build headers with authentication
  const requestHeaders: Record<string, string> = { ...headers };

  if (!skipAuth) {
    // fetchAccessToken handles error reporting and redirects automatically
    // If it throws, the error will propagate naturally
    const token = await fetchAccessToken();
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  // Make the request
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    // Handle 403 Forbidden specifically
    if (response.status === 403 && !skip403Retry) {
      // Log the 403 error for tracking
      reportApiError(new Error(`403 Forbidden from ${url}`), {
        operation: "fetchWithAuth",
        component: "http-client",
        url,
        additionalData: {
          statusCode: 403,
        },
      });

      // Attempt token refresh by fetching a new token
      // If the backend revoked permissions, this will get the latest token
      try {
        const newToken = await fetchAccessToken();
        requestHeaders.Authorization = `Bearer ${newToken}`;

        // Retry the request with the refreshed token
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: requestHeaders,
        });

        // If still 403 after refresh, user truly doesn't have permission
        if (retryResponse.status === 403) {
          triggerSilentLogout("403 Forbidden persisted after token refresh");
          throw new ForbiddenError(
            "Access denied after token refresh",
            retryResponse,
          );
        }

        // Retry succeeded
        return retryResponse;
      } catch (error) {
        // If token refresh fails, logout
        if (error instanceof ForbiddenError) {
          throw error;
        }
        triggerSilentLogout("Token refresh failed on 403 error");
        throw new ForbiddenError(
          "Failed to refresh token after 403 error",
          response,
        );
      }
    }

    // For non-403 responses, return as-is
    return response;
  } catch (error) {
    // Network errors or fetch failures
    if (error instanceof ForbiddenError) {
      throw error;
    }

    // Report as API error
    reportApiError(error as Error, {
      operation: "fetchWithAuth",
      component: "http-client",
      url,
    });

    throw error;
  }
}

/**
 * React hook for authenticated fetch in components
 *
 * @returns fetchWithAuth function
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const fetch = useAuthenticatedFetch();
 *
 *   useEffect(() => {
 *     async function loadData() {
 *       const response = await fetch('https://api.example.com/data');
 *       const data = await response.json();
 *       setData(data);
 *     }
 *     loadData();
 *   }, [fetch]);
 * }
 * ```
 */
export function useAuthenticatedFetch() {
  // Return the fetchWithAuth function
  // In the future, this could be enhanced with additional React-specific features
  return fetchWithAuth;
}
