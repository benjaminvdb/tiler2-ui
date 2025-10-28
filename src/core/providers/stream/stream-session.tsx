import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import { useUser } from "@auth0/nextjs-auth0";
import {
  uiMessageReducer,
  isUIMessage,
  isRemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { toast } from "sonner";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { StreamContext } from "./stream-context";
import { useTypedStream, StreamSessionProps } from "./types";
import { sleep, checkGraphStatus } from "./utils";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { useLogger } from "@/core/services/logging";
import * as Sentry from "@sentry/nextjs";

export const StreamSession: React.FC<StreamSessionProps> = ({
  children,
  apiUrl,
  assistantId,
}) => {
  const [threadId, setThreadId] = useSearchParamState("threadId");
  const { getThreads, setThreads } = useThreads();
  const threadFetchControllerRef = useRef<AbortController | null>(null);
  const { user, isLoading: isUserLoading } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<Error | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);

  // Get logger with component context
  const baseLogger = useLogger();
  const logger = useMemo(
    () =>
      baseLogger.child({
        assistantId,
        apiUrl,
        component: "StreamSession",
      }),
    [baseLogger, assistantId, apiUrl],
  );

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

  // Fetch access token once on mount if we don't have one
  // The `accessToken` check prevents unnecessary refetches - token is reused until cleared
  // Auth0's getAccessToken() automatically refreshes server-side if expired
  // 403 retry mechanism in fetchWithAuth() handles expired tokens during API calls
  useEffect(() => {
    if (!user || isUserLoading || accessToken) return;

    const fetchToken = async () => {
      try {
        const response = await fetch("/api/auth/token");

        // Handle 403 Forbidden - user session invalid or permissions revoked
        if (response.status === 403) {
          logger.error(new Error("403 Forbidden from token endpoint"), {
            operation: "token_fetch",
            statusCode: 403,
          });
          // Trigger immediate logout - cannot recover from 403 at token level
          window.location.href = "/api/auth/logout";
          return;
        }

        // Handle 401 Unauthorized - session expired
        if (response.status === 401) {
          logger.error(new Error("401 Unauthorized - session expired"), {
            operation: "token_fetch",
            statusCode: 401,
          });
          // Redirect to login
          window.location.href = "/api/auth/login";
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Token fetch failed: ${response.status}`,
          );
        }

        const data: { token: string } = await response.json();
        setAccessToken(data.token);
        setTokenError(null);

        logger.debug("Token fetched successfully", {
          operation: "token_fetch",
        });
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
  }, [user, isUserLoading, accessToken, logger]);

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
            logger.error(error, {
              operation: "fetch_threads",
              threadId: id,
            });
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
          logger.error(error, {
            operation: "check_graph_status",
            apiUrl,
          });
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
  }, [apiUrl, logger]);

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
            <p className="text-muted-foreground text-sm">
              Your session may have expired. Please log in again.
            </p>
            <button
              onClick={() => (window.location.href = "/auth/login")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm"
            >
              Log In
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
