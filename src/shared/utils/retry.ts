/**
 * Retry utilities with exponential backoff and jitter.
 * Implements best practices for handling transient network failures.
 */

import { reportNetworkError } from "@/core/services/error-reporting";

export interface RetryConfig {
  /** Maximum number of retry attempts (default: 4) */
  maxRetries?: number;
  /** Base delay in milliseconds for first retry (default: 1000ms) */
  baseDelay?: number;
  /** Maximum delay in milliseconds to cap exponential backoff (default: 16000ms) */
  maxDelay?: number;
  /** Whether to add jitter to prevent thundering herd (default: true) */
  useJitter?: boolean;
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
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

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

  // Network errors are retryable
  if (
    error.message.includes("fetch failed") ||
    error.message.includes("Failed to fetch") ||
    error.message.includes("NetworkError") ||
    error.message.includes("network")
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
 * Calculates delay for next retry using exponential backoff with optional jitter.
 *
 * @param attempt - Current attempt number (0-indexed)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
function calculateDelay(
  attempt: number,
  config: {
    baseDelay: number;
    maxDelay: number;
    useJitter: boolean;
  },
): number {
  const { baseDelay, maxDelay, useJitter } = config;

  // Exponential backoff: baseDelay × 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Apply full jitter to prevent thundering herd
  if (useJitter) {
    return Math.random() * cappedDelay;
  }

  return cappedDelay;
}

/**
 * Sleeps for specified duration with optional abort signal.
 */
async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

/**
 * Wraps a fetch call with retry logic using exponential backoff and jitter.
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
 * @param options - Fetch options (including signal for cancellation)
 * @param config - Retry configuration
 * @returns Promise resolving to Response
 * @throws Error if all retries exhausted or non-retryable error occurs
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  config: RetryConfig = {},
): Promise<Response> {
  const maxRetries = config.maxRetries ?? 4;
  const baseDelay = config.baseDelay ?? 1000;
  const maxDelay = config.maxDelay ?? 16000;
  const useJitter = config.useJitter ?? true;
  const onRetry = config.onRetry;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create fresh AbortController for each attempt (never reuse)
      const attemptController = new AbortController();

      // Combine external abort signal with attempt-specific controller
      const combinedSignal = options.signal
        ? AbortSignal.any([options.signal, attemptController.signal])
        : attemptController.signal;

      const response = await fetch(url, {
        ...options,
        signal: combinedSignal,
      });

      // Check if response status is retryable
      if (isRetryableResponse(response)) {
        const error = new Error(
          `Retryable status code: ${response.status}`,
        ) as RetryableError;
        error.isRetryable = true;
        error.statusCode = response.status;
        throw error;
      }

      // Success or non-retryable error
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Don't retry if user aborted
      if (err.name === "AbortError") {
        throw err;
      }

      // Don't retry if it's the last attempt
      if (attempt === maxRetries) {
        reportNetworkError(err, {
          operation: "fetchWithRetry",
          component: "retry utilities",
          url,
          additionalData: {
            attempts: attempt + 1,
            exhaustedRetries: true,
          },
        });
        throw err;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(err)) {
        throw err;
      }

      lastError = err;

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, err);
      }

      // Calculate delay with exponential backoff and jitter
      const delay = calculateDelay(attempt, {
        baseDelay,
        maxDelay,
        useJitter,
      });

      // Wait before next retry (respects abort signal)
      await sleep(delay, options.signal ?? undefined);
    }
  }

  // Should never reach here due to throw in last attempt
  throw lastError || new Error("Retry logic failed unexpectedly");
}

/**
 * Wraps an async function with retry logic.
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
export function withRetry<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  config: RetryConfig = {},
): (signal?: AbortSignal) => Promise<T> {
  return async (signal?: AbortSignal) => {
    const maxRetries = config.maxRetries ?? 4;
    const baseDelay = config.baseDelay ?? 1000;
    const maxDelay = config.maxDelay ?? 16000;
    const useJitter = config.useJitter ?? true;
    const onRetry = config.onRetry;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(signal);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        // Don't retry if user aborted
        if (err.name === "AbortError") {
          throw err;
        }

        // Don't retry if it's the last attempt
        if (attempt === maxRetries) {
          throw err;
        }

        // Don't retry if error is not retryable
        if (!isRetryableError(err)) {
          throw err;
        }

        lastError = err;

        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt + 1, err);
        }

        // Calculate delay with exponential backoff and jitter
        const delay = calculateDelay(attempt, {
          baseDelay,
          maxDelay,
          useJitter,
        });

        // Wait before next retry (respects abort signal)
        await sleep(delay, signal);
      }
    }

    throw lastError || new Error("Retry logic failed unexpectedly");
  };
}
