/**
 * Retry utilities using p-retry with exponential backoff and jitter.
 * Wraps the battle-tested p-retry library to add HTTP status code handling,
 * AbortSignal integration, and error reporting.
 */

import pRetry, { AbortError as PRetryAbortError } from "p-retry";
import * as Sentry from "@sentry/react";
import { reportNetworkError } from "@/core/services/observability";

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

export const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Determines if an HTTP response should trigger a retry.
 */
export const isRetryableResponse = (response: Response): boolean =>
  RETRYABLE_STATUS_CODES.includes(response.status);

/**
 * Check if error message indicates a network error
 */
const isNetworkErrorMessage = (message: string): boolean => {
  return (
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("the internet connection appears to be offline")
  );
};

/**
 * Determines if an error is retryable (network errors, timeouts, etc).
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === "AbortError" || error instanceof PRetryAbortError) {
    return false;
  }

  const message = error.message.toLowerCase();
  if (isNetworkErrorMessage(message)) return true;

  if ("isRetryable" in error && typeof error.isRetryable === "boolean") {
    return error.isRetryable;
  }

  return false;
}

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
      const attemptController = new AbortController();

      const combinedSignal = createCombinedSignal(signal, timeoutMs);

      if (combinedSignal) {
        combinedSignal.addEventListener(
          "abort",
          () => {
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

        if (isRetryableResponse(response)) {
          const error = new Error(
            `HTTP ${response.status}: ${response.statusText}`,
          ) as RetryableError;
          error.isRetryable = true;
          error.statusCode = response.status;
          throw error;
        }

        if (response.status >= 400 && response.status < 500) {
          throw new PRetryAbortError(
            `HTTP ${response.status}: ${response.statusText}`,
          );
        }

        return response;
      } catch (error) {
        if (signal?.aborted) {
          throw new PRetryAbortError("Request aborted by user");
        }

        if (isRetryableError(error)) {
          throw error;
        }

        throw error;
      }
    },
    {
      retries: maxRetries,
      factor: 2,
      minTimeout: baseDelay,
      maxTimeout: maxDelay,
      randomize: true,
      ...(maxRetryTime !== undefined && { maxRetryTime }),
      onFailedAttempt: (error) => {
        if (onRetry) {
          onRetry(error.attemptNumber, error);
        }

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

export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
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
          if (signal?.aborted) {
            throw new PRetryAbortError("Operation aborted by user");
          }

          if (!isRetryableError(error)) {
            if (error instanceof Error) {
              throw new PRetryAbortError(error.message);
            }
            throw new PRetryAbortError(String(error));
          }

          throw error;
        }
      },
      {
        retries: maxRetries,
        factor: 2,
        minTimeout: baseDelay,
        maxTimeout: maxDelay,
        randomize: true,
        ...(maxRetryTime !== undefined && { maxRetryTime }),
        onFailedAttempt: (error) => {
          if (onRetry) {
            onRetry(error.attemptNumber, error);
          }
        },
      },
    );
  }) as T;
}
