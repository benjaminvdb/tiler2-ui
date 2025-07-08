/**
 * Hook for safely getting access tokens with proper error handling
 * Automatically handles AccessTokenError by redirecting to login
 */

import { getAccessToken } from "@auth0/nextjs-auth0";
import { useCallback } from "react";
import { handleTokenError } from "../utils/token-error-handler";

interface UseAccessTokenOptions {
  component?: string;
  operation?: string;
}

interface UseAccessTokenResult {
  /**
   * Get an access token safely with error handling
   * Returns null if token error occurs (user will be redirected to login)
   */
  getToken: () => Promise<string | null>;
}

/**
 * Hook for safely getting access tokens with proper error handling
 * Automatically handles AccessTokenError by redirecting to login
 */
export const useAccessToken = (
  options: UseAccessTokenOptions = {}
): UseAccessTokenResult => {
  const { component = "useAccessToken", operation = "getAccessToken" } = options;

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const tokenResult = await getAccessToken();
      return tokenResult;
    } catch (error) {
      if (handleTokenError(error, { component, operation })) {
        return null;
      }
      throw error;
    }
  }, [component, operation]);

  return {
    getToken,
  };
};