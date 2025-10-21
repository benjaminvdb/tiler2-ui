import React, { useEffect, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import { useUser } from "@auth0/nextjs-auth0";
import {
  uiMessageReducer,
  isUIMessage,
  isRemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { toast } from "sonner";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { checkTokenExpiry } from "@/features/auth/utils/token-utils";
import { StreamContext } from "./stream-context";
import { useTypedStream, StreamSessionProps } from "./types";
import { sleep, checkGraphStatus } from "./utils";
import { LoadingScreen } from "@/shared/components/loading-spinner";

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
  const [tokenError, setTokenError] = useState<Error | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || isUserLoading) return;

    const fetchToken = async (retryCount: number = 0) => {
      try {
        const response = await fetch("/api/auth/token");

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Retry once on 401 errors (token might have just expired)
          if (response.status === 401 && retryCount < 1) {
            console.log("Token fetch failed with 401, retrying...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return fetchToken(retryCount + 1);
          }

          throw new Error(
            errorData.error || `Token fetch failed: ${response.status}`,
          );
        }

        const data = await response.json();

        // Verify token is not already expired or expiring very soon
        const tokenStatus = checkTokenExpiry(data.token, 30); // 30 second buffer
        if (tokenStatus.isExpired) {
          console.warn("Received expired token from server");
          throw new Error("Received expired token");
        }

        if (tokenStatus.isExpiringSoon) {
          console.warn(
            `Token expires soon (in ${tokenStatus.secondsUntilExpiry}s)`,
          );
        }

        setAccessToken(data.token);
        setTokenError(null);
      } catch (error) {
        console.error("Failed to fetch access token:", error);
        setTokenError(
          error instanceof Error ? error : new Error(String(error)),
        );
        setAccessToken(null);
      }
    };

    fetchToken();

    // Refresh token every 10 minutes (more aggressive to avoid expiration)
    // Auth0 tokens typically expire after 15 minutes, so this provides a
    // 5-minute safety buffer before expiration
    const intervalId = setInterval(() => fetchToken(), 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, isUserLoading]);

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
          <p className="text-destructive">
            Authentication error: {tokenError.message}
          </p>
          <p className="text-sm">Please refresh the page or log in again.</p>
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
