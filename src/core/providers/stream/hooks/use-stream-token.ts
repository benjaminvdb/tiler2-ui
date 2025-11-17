import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import type { Logger } from "@/core/services/observability";

/**
 * Hook to manage access token for stream authentication
 */
export function useStreamToken(logger: Logger) {
  const { user, isLoading: isUserLoading } = useAuth0();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<Error | null>(null);

  const { getToken } = useAccessToken({
    component: "StreamSession",
    operation: "fetchAccessToken",
  });

  useEffect(() => {
    if (!user || isUserLoading || accessToken) return;

    const fetchToken = async () => {
      try {
        const token = await getToken();

        if (token) {
          setAccessToken(token);
          setTokenError(null);
          logger.debug("Token fetched successfully", {
            operation: "token_fetch",
          });
          return;
        }

        const err = new Error("Failed to resolve access token");
        setTokenError(err);
        setAccessToken(null);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error(err, {
          operation: "token_fetch",
        });
        setTokenError(err);
        setAccessToken(null);
      }
    };

    fetchToken();
  }, [user, isUserLoading, accessToken, getToken, logger]);

  return {
    accessToken,
    tokenError,
    isUserLoading,
    user,
    setAccessToken,
  };
}
