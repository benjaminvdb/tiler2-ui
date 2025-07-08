/**
 * Centralized Auth0 token error handling utility
 * Provides consistent handling for AccessTokenError across the application
 */

import { reportAuthError } from "@/core/services/error-reporting";

export interface TokenErrorContext {
  operation?: string;
  component?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Checks if an error is an Auth0 AccessTokenError
 */
export const isAccessTokenError = (error: unknown): error is Error => {
  return error instanceof Error && error.name === "AccessTokenError";
};

/**
 * Handles Auth0 token errors consistently across the application
 * @param error - The error to handle
 * @param context - Additional context for error reporting
 * @returns true if the error was handled, false otherwise
 */
export const handleTokenError = (
  error: unknown,
  context: TokenErrorContext = {},
): boolean => {
  if (!isAccessTokenError(error)) {
    return false;
  }

  // Report the token error for monitoring
  reportAuthError(error, {
    operation: context.operation || "unknown",
    component: context.component || "unknown",
    additionalData: {
      errorType: "AccessTokenError",
      ...context.additionalData,
    },
  });

  // Redirect to login for re-authentication
  if (typeof window !== "undefined") {
    window.location.href = "/api/auth/login";
  }

  return true;
};

/**
 * Wraps an async function that may throw AccessTokenError
 * Automatically handles token errors and redirects to login
 */
export const withTokenErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context: TokenErrorContext = {},
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (handleTokenError(error, context)) {
        return null;
      }
      throw error;
    }
  };
};

/**
 * Wraps a regular function that may throw AccessTokenError
 * Automatically handles token errors and redirects to login
 */
export const withSyncTokenErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => R,
  context: TokenErrorContext = {},
) => {
  return (...args: T): R | null => {
    try {
      return fn(...args);
    } catch (error) {
      if (handleTokenError(error, context)) {
        return null;
      }
      throw error;
    }
  };
};
