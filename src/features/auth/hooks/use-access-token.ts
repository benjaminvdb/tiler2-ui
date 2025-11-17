/**
 * Hook for safely getting access tokens with proper error handling
 * Automatically handles AccessTokenError by redirecting to login
 */

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";
import { handleTokenError } from "../utils/token-error-handler";
import { env } from "@/env";

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
  options: UseAccessTokenOptions = {},
): UseAccessTokenResult => {
  const { component = "useAccessToken", operation = "getAccessToken" } =
    options;
  const { getAccessTokenSilently } = useAuth0();

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: env.AUTH0_AUDIENCE
          ? { audience: env.AUTH0_AUDIENCE }
          : {},
      });
      return token;
    } catch (error) {
      if (handleTokenError(error, { component, operation })) {
        return null;
      }
      throw error;
    }
  }, [component, operation, getAccessTokenSilently]);

  return {
    getToken,
  };
};
