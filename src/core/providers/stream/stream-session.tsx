import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { useUser } from "@auth0/nextjs-auth0";
import {
  uiMessageReducer,
  isUIMessage,
  isRemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { toast } from "sonner";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { calculateTokenTimings } from "@/features/auth/config/token-config";
import { checkTokenExpiry } from "@/features/auth/utils/token-utils";
import { StreamContext } from "./stream-context";
import { useTypedStream, StreamSessionProps } from "./types";
import { sleep, checkGraphStatus } from "./utils";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import * as Sentry from "@sentry/nextjs";

export const StreamSession: React.FC<StreamSessionProps> = ({
  children,
  apiUrl,
  assistantId,
}) => {
  const [threadId, setThreadId] = useQueryState("threadId");
  const { getThreads, setThreads } = useThreads();
  const threadFetchControllerRef = useRef<AbortController | null>(null);
  const { user, isLoading: isUserLoading } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const [tokenError, setTokenError] = useState<Error | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  // Set Sentry context for assistant and API URL
  useEffect(() => {
    if (assistantId) {
      Sentry.setContext("assistant", {
        id: assistantId,
        apiUrl: apiUrl,
      });
      Sentry.setTag("assistant_id", assistantId);
    }
  }, [assistantId, apiUrl]);

  // Refactored fetchToken as useCallback for reuse across multiple effects
  const fetchToken = useCallback(async (retryCount: number = 0) => {
    try {
      const response = await fetch("/api/auth/token");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Retry once on 401 errors (token might have just expired)
        if (response.status === 401 && retryCount < 1) {
          console.log("[Token] Fetch failed with 401, retrying...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return fetchToken(retryCount + 1);
        }

        throw new Error(
          errorData.error || `Token fetch failed: ${response.status}`,
        );
      }

      const data: { token: string; expiresAt: number } = await response.json();

      // Calculate dynamic timing configuration from actual token expiration
      const timings = calculateTokenTimings(data.expiresAt);

      // Verify token is not already expired or expiring very soon
      const tokenStatus = checkTokenExpiry(
        data.token,
        timings.minimalBufferSeconds,
      );
      if (tokenStatus.isExpired) {
        console.warn("[Token] Received expired token from server");
        throw new Error("Received expired token");
      }

      if (tokenStatus.isExpiringSoon) {
        console.warn(
          `[Token] Token expires soon (in ${tokenStatus.secondsUntilExpiry}s)`,
        );
      }

      // Diagnostic: Decode and log token payload to debug email format issue
      try {
        const parts = data.token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(
            atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
          );
          console.log("[Token Debug] Token payload:", {
            email: payload.email,
            emailType: typeof payload.email,
            sub: payload.sub,
            aud: payload.aud,
            customEmail: payload[`${payload.aud}/email`],
            allKeys: Object.keys(payload),
          });
        }
      } catch (decodeError) {
        console.error("[Token Debug] Failed to decode token:", decodeError);
      }

      setAccessToken(data.token);
      setTokenExpiresAt(data.expiresAt);
      setTokenError(null);
    } catch (error) {
      console.error("[Token] Failed to fetch access token:", error);
      setTokenError(
        error instanceof Error ? error : new Error(String(error)),
      );
      setAccessToken(null);
    }
  }, []);

  // Initial token fetch (only on mount or when user changes)
  useEffect(() => {
    if (!user || isUserLoading || accessToken) return; // Don't fetch if already have token

    fetchToken();
  }, [user, isUserLoading, accessToken, fetchToken]);

  // Set up periodic refresh based on token expiration
  useEffect(() => {
    if (!tokenExpiresAt) return;

    const timings = calculateTokenTimings(tokenExpiresAt);

    // Refresh token at 2/3 of remaining lifetime
    const intervalId = setInterval(() => {
      console.log(
        `[Token] Periodic refresh triggered (every ${timings.refreshIntervalSeconds}s)`,
      );
      fetchToken();
    }, timings.refreshIntervalMs);

    return () => clearInterval(intervalId);
  }, [tokenExpiresAt, fetchToken]);

  // Detect when tab becomes visible after being hidden (primary solution)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && accessToken && tokenExpiresAt) {
        // Calculate current timing based on token expiration
        const timings = calculateTokenTimings(tokenExpiresAt);

        // Tab became visible - check if token needs refresh
        const tokenStatus = checkTokenExpiry(
          accessToken,
          timings.expiryBufferSeconds,
        );

        if (tokenStatus.isExpired || tokenStatus.isExpiringSoon) {
          console.log(
            `[Token] Tab became visible with ${tokenStatus.isExpired ? "expired" : "expiring"} token ` +
              `(${tokenStatus.secondsUntilExpiry}s remaining), refreshing...`,
          );
          await fetchToken();
        } else {
          console.log(
            `[Token] Tab became visible, token still valid (${tokenStatus.secondsUntilExpiry}s remaining)`,
          );
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [accessToken, tokenExpiresAt, fetchToken]);

  // Detect when window gains focus (backup for browsers with inconsistent visibilitychange)
  useEffect(() => {
    const handleFocus = async () => {
      if (accessToken && tokenExpiresAt) {
        // Calculate current timing based on token expiration
        const timings = calculateTokenTimings(tokenExpiresAt);

        const tokenStatus = checkTokenExpiry(
          accessToken,
          timings.expiryBufferSeconds,
        );

        if (tokenStatus.isExpired || tokenStatus.isExpiringSoon) {
          console.log(
            `[Token] Window focused with ${tokenStatus.isExpired ? "expired" : "expiring"} token, refreshing...`,
          );
          await fetchToken();
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [accessToken, tokenExpiresAt, fetchToken]);

  const streamConfig = {
    apiUrl,
    apiKey: undefined, // Don't use LangSmith API key - we're using Auth0
    assistantId,
    threadId: threadId ?? null,
    // Pass Auth0 token as Authorization header
    defaultHeaders: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  };

  const streamValue = useTypedStream({
    ...streamConfig,
    fetchStateHistory: true,
    onMetadataEvent: (data) => {
      // Capture run_id from metadata events for trace tracking
      if (data.run_id) {
        setCurrentRunId(data.run_id);
      }
    },
    onCustomEvent: (event, options) => {
      if (isUIMessage(event) || isRemoveUIMessage(event)) {
        options.mutate((prev) => {
          const ui = uiMessageReducer(prev.ui ?? [], event);
          return { ...prev, ui };
        });
      }
    },
    onThreadId: (id) => {
      setThreadId(id);

      // Cancel any previous thread fetch operation
      if (threadFetchControllerRef.current) {
        threadFetchControllerRef.current.abort();
      }
      // Create new controller for this fetch operation
      const controller = new AbortController();
      threadFetchControllerRef.current = controller;

      // Refetch threads list when thread ID changes.
      // Wait for some seconds before fetching so we're able to get the new thread that was created.
      const fetchThreadsWithDelay = async () => {
        try {
          await sleep(4000, controller.signal);

          if (controller.signal.aborted) {
            throw new DOMException("Aborted", "AbortError");
          }
          const threads = await getThreads();

          if (!controller.signal.aborted) {
            setThreads(threads);
          }
        } catch (error: unknown) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Failed to fetch threads:", error);
          }
        }
      };

      fetchThreadsWithDelay();
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    const checkStatus = async () => {
      try {
        const ok = await checkGraphStatus(apiUrl, null, controller.signal);

        // Only show toast if component is still mounted
        if (!controller.signal.aborted && !ok) {
          toast.error("Failed to connect to LangGraph server", {
            description: () => (
              <p>
                Please ensure your graph is running at <code>{apiUrl}</code> and
                you are properly authenticated.
              </p>
            ),
            duration: 10000,
            richColors: true,
            closeButton: true,
          });
        }
      } catch (error: unknown) {
        // Don't show errors for aborted requests
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to check graph status:", error);
        }
      }
    };

    checkStatus();

    return () => {
      controller.abort();
      // Also cancel any pending thread fetch operations
      if (threadFetchControllerRef.current) {
        threadFetchControllerRef.current.abort();
      }
    };
  }, [apiUrl]);

  // Extend stream context with currentRunId and threadId for trace tracking
  const extendedStreamValue = {
    ...streamValue,
    currentRunId,
    threadId,
  };

  // Show loading state while fetching token
  if (isUserLoading || (!accessToken && !tokenError && user)) {
    return (
      <StreamContext.Provider value={extendedStreamValue}>
        <LoadingScreen />
      </StreamContext.Provider>
    );
  }

  // Show error if token fetch failed
  if (tokenError) {
    return (
      <StreamContext.Provider value={extendedStreamValue}>
        <LoadingScreen>
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive">
              Authentication error: {tokenError.message}
            </p>
            <p className="text-sm text-muted-foreground">
              This may occur after leaving the tab inactive for extended
              periods.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Refresh Page
            </button>
          </div>
        </LoadingScreen>
      </StreamContext.Provider>
    );
  }

  return (
    <StreamContext.Provider value={extendedStreamValue}>
      {children}
    </StreamContext.Provider>
  );
};
