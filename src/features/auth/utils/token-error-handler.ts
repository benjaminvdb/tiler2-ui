/**
 * Centralized Auth0 token error handling utility
 * Provides consistent handling for AccessTokenError across the application
 */

import { reportAuthError } from "@/core/services/observability";

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
  {
    operation = "unknown",
    component = "unknown",
    additionalData,
  }: TokenErrorContext = {},
): boolean => {
  if (!isAccessTokenError(error)) {
    return false;
  }

  reportAuthError(error, {
    operation,
    component,
    additionalData: {
      errorType: "AccessTokenError",
      ...additionalData,
    },
  });

  // Don't redirect here - let the ProtectedRoute component handle authentication
  // via loginWithRedirect(). This prevents hard-coded redirects to non-existent routes.

  return true;
};
