/**
 * Retry utilities using p-retry with exponential backoff and jitter.
 * Wraps the battle-tested p-retry library to add HTTP status code handling,
 * AbortSignal integration, and error reporting.
 */

import pRetry, { AbortError as PRetryAbortError } from "p-retry";
import * as Sentry from "@sentry/nextjs";
import { reportNetworkError } from "@/core/services/error-reporting";

// Re-export AbortError for consumers
export { AbortError } from "p-retry";

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 4) */
  maxRetries?: number;
  /** Base delay in milliseconds for first retry (default: 1000ms) */
  baseDelay?: number;
  /** Maximum delay in milliseconds to cap exponential backoff (default: 16000ms) */
  maxDelay?: number;
  /** Maximum total time for all retry attempts in milliseconds */
  maxRetryTime?: number;
  /** Optional AbortSignal to cancel retry attempts */
  signal?: AbortSignal;
  /** Optional callback called before each retry */
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RetryableError extends Error {
  isRetryable: boolean;
  statusCode?: number;
}

/**
 * HTTP status codes that should trigger a retry attempt.
 * Based on industry best practices:
 * - 408: Request Timeout
 * - 429: Too Many Requests (rate limiting)
 * - 500: Internal Server Error
 * - 502: Bad Gateway
 * - 503: Service Unavailable
 * - 504: Gateway Timeout
 */
export const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Determines if an HTTP response should trigger a retry.
 */
export function isRetryableResponse(response: Response): boolean {
  return RETRYABLE_STATUS_CODES.includes(response.status);
}

/**
 * Determines if an error is retryable (network errors, timeouts, etc).
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  // AbortError from user cancellation should not be retried
  if (error.name === "AbortError") return false;
  if (error instanceof PRetryAbortError) return false;

  // Network errors are retryable
  const message = error.message.toLowerCase();
  if (
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("the internet connection appears to be offline")
  ) {
    return true;
  }

  // Check if it's a RetryableError with explicit flag
  if ("isRetryable" in error && typeof error.isRetryable === "boolean") {
    return error.isRetryable;
  }

  return false;
}

/**
 * Helper to create combined abort signal from multiple sources.
 */
function createCombinedSignal(
  externalSignal?: AbortSignal,
  timeoutMs?: number,
): AbortSignal | undefined {
  const signals: AbortSignal[] = [];

  if (externalSignal) signals.push(externalSignal);
  if (timeoutMs) signals.push(AbortSignal.timeout(timeoutMs));

  if (signals.length === 0) return undefined;
  if (signals.length === 1) return signals[0];
  return AbortSignal.any(signals);
}

/**
 * Wraps a fetch call with retry logic using p-retry.
 *
 * @example
 * ```typescript
 * const response = await fetchWithRetry('https://api.example.com/data', {
 *   method: 'GET',
 *   headers: { 'Authorization': 'Bearer token' }
 * }, {
 *   maxRetries: 3,
 *   baseDelay: 1000,
 *   onRetry: (attempt, error) => {
 *     console.log(`Retry attempt ${attempt}: ${error.message}`);
 *   }
 * });
 * ```
 *
 * @param url - Request URL
 * @param options - Fetch options (including optional timeoutMs)
 * @param config - Retry configuration
 * @returns Promise resolving to Response
 * @throws Error if all retries exhausted or non-retryable error occurs
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
  config: RetryConfig = {},
): Promise<Response> {
  const {
    maxRetries = 4,
    baseDelay = 1000,
    maxDelay = 16000,
    maxRetryTime,
    signal,
    onRetry,
  } = config;

  const { timeoutMs, ...fetchOptions } = options;

  return await pRetry(
    async () => {
      // Create fresh AbortController for this attempt
      const attemptController = new AbortController();

      // Combine: external signal + timeout + attempt controller
      const combinedSignal = createCombinedSignal(signal, timeoutMs);

      // Link combined signal to attempt controller
      if (combinedSignal) {
        combinedSignal.addEventListener(
          "abort",
          () => {
            // Propagate abort reason to provide clear error messages
            const reason =
              combinedSignal.reason ||
              new DOMException(
                timeoutMs
                  ? `Request timeout after ${timeoutMs}ms`
                  : "Request aborted",
                "AbortError",
              );
            attemptController.abort(reason);
          },
          { once: true },
        );
      }

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: attemptController.signal,
        });

        // CRITICAL: Check HTTP status codes (p-retry doesn't do this automatically)
        if (isRetryableResponse(response)) {
          // Throw regular Error to trigger p-retry retry
          const error = new Error(
            `HTTP ${response.status}: ${response.statusText}`,
          ) as RetryableError;
          error.isRetryable = true;
          error.statusCode = response.status;
          throw error;
        }

        // Non-retryable client errors - abort immediately
        if (response.status >= 400 && response.status < 500) {
          throw new PRetryAbortError(
            `HTTP ${response.status}: ${response.statusText}`,
          );
        }

        return response;
      } catch (error) {
        // Check if abort was requested by user
        if (signal?.aborted) {
          throw new PRetryAbortError("Request aborted by user");
        }

        // Check if this is a network error (p-retry handles these automatically)
        if (isRetryableError(error)) {
          throw error; // p-retry will retry
        }

        // Unknown error - throw as-is and let p-retry decide
        throw error;
      }
    },
    {
      retries: maxRetries,
      factor: 2, // Exponential backoff factor
      minTimeout: baseDelay,
      maxTimeout: maxDelay,
      randomize: true, // Adds jitter to prevent thundering herd
      ...(maxRetryTime !== undefined && { maxRetryTime }), // Only include if defined
      onFailedAttempt: (error) => {
        // Call user's retry callback if provided
        if (onRetry) {
          onRetry(error.attemptNumber, error);
        }

        // Integrate with error reporting
        // Silent retries - only report final failure
        if (error.retriesLeft === 0) {
          reportNetworkError(error, {
            operation: "fetchWithRetry",
            component: "retry utilities",
            url,
            additionalData: {
              attempts: error.attemptNumber,
              exhaustedRetries: true,
            },
          });
        } else {
          // Add Sentry breadcrumb for each retry (don't capture exception)
          Sentry.addBreadcrumb({
            category: "retry",
            message: `Retry attempt ${error.attemptNumber} for ${url}`,
            level: "info",
            data: {
              retriesLeft: error.retriesLeft,
              error: error.message,
            },
          });
        }
      },
    },
  );
}

/**
 * Wraps an async function with retry logic using p-retry.
 *
 * @example
 * ```typescript
 * const getData = withRetry(
 *   async (signal) => {
 *     const response = await fetch('/api/data', { signal });
 *     if (!response.ok) throw new Error('Failed');
 *     return response.json();
 *   },
 *   { maxRetries: 3 }
 * );
 *
 * const data = await getData(abortSignal);
 * ```
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: RetryConfig = {},
): T {
  return (async (...args: Parameters<T>) => {
    const {
      maxRetries = 4,
      baseDelay = 1000,
      maxDelay = 16000,
      maxRetryTime,
      signal,
      onRetry,
    } = config;

    return await pRetry(
      async () => {
        try {
          return await fn(...args);
        } catch (error) {
          // Check if user requested abort
          if (signal?.aborted) {
            throw new PRetryAbortError("Operation aborted by user");
          }

          // Check if error is retryable
          if (!isRetryableError(error)) {
            // Non-retryable error - abort p-retry
            if (error instanceof Error) {
              throw new PRetryAbortError(error.message);
            }
            throw new PRetryAbortError(String(error));
          }

          throw error; // Let p-retry decide
        }
      },
      {
        retries: maxRetries,
        factor: 2,
        minTimeout: baseDelay,
        maxTimeout: maxDelay,
        randomize: true,
        ...(maxRetryTime !== undefined && { maxRetryTime }), // Only include if defined
        onFailedAttempt: (error) => {
          if (onRetry) {
            onRetry(error.attemptNumber, error);
          }
        },
      },
    );
  }) as T;
}
