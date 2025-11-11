import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { useTypedStream, StreamSessionProps, GraphState } from "./types";
import { sleep, checkGraphStatus } from "./utils";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { useLogger } from "@/core/services/logging";
import * as Sentry from "@sentry/nextjs";
import { fetchWithRetry } from "@/shared/utils/retry";
import {
  reportAuthError,
  reportStreamError,
} from "@/core/services/error-reporting";

export const StreamSession: React.FC<StreamSessionProps> = ({
  children,
  apiUrl,
  assistantId,
}) => {
  const [threadId, setThreadId] = useSearchParamState("threadId");
  const { getThreads, setThreads, removeOptimisticThread } = useThreads();
  const threadFetchControllerRef = useRef<AbortController | null>(null);
  const { user, isLoading: isUserLoading } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<Error | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<Error | null>(null);

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

  useEffect(() => {
    if (assistantId) {
      Sentry.setContext("assistant", {
        id: assistantId,
        apiUrl: apiUrl,
      });
      Sentry.setTag("assistant_id", assistantId);
    }
  }, [assistantId, apiUrl]);

  /**
   * Fetch access token on mount. Token is reused until cleared or invalidated.
   * Auth0 handles server-side refresh automatically when expired.
   * Uses retry logic to handle transient network errors.
   */
  useEffect(() => {
    if (!user || isUserLoading || accessToken) return;

    const fetchToken = async () => {
      try {
        const response = await fetchWithRetry(
          "/api/auth/token",
          {
            headers: { "Content-Type": "application/json" },
            timeoutMs: 10000, // Increased to 10s for auth endpoint reliability
          },
          {
            maxRetries: 3,
            baseDelay: 500, // Fast retry for auth
            maxDelay: 2000,
            onRetry: (attempt, error) => {
              reportAuthError(error, {
                operation: "fetchAccessToken",
                component: "StreamSession",
                skipNotification: true, // Silent retry
                additionalData: {
                  attempt,
                },
              });
            },
          },
        );

        if (response.status === 403) {
          logger.error(new Error("403 Forbidden from token endpoint"), {
            operation: "token_fetch",
            statusCode: 403,
          });
          window.location.href = "/api/auth/logout";
          return;
        }

        if (response.status === 401) {
          logger.error(new Error("401 Unauthorized - session expired"), {
            operation: "token_fetch",
            statusCode: 401,
          });
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
        reportAuthError(err, {
          operation: "fetchAccessToken",
          component: "StreamSession",
        });
        setTokenError(err);
        setAccessToken(null);
      }
    };

    fetchToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isUserLoading, accessToken]); // Removed logger to prevent unnecessary re-runs

  /**
   * Create stream configuration only when token is available.
   * This prevents SDK from being initialized without authentication headers,
   * which was causing LINK-AI-FRONTEND-13 (403 "no authentication token provided").
   */
  const streamConfig = useMemo(() => {
    if (!accessToken) return null;

    return {
      apiUrl,
      apiKey: undefined,
      assistantId,
      threadId: threadId ?? null,
      timeoutMs: 15000, // 15 second timeout for all SDK operations
      defaultHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }, [accessToken, apiUrl, assistantId, threadId]);

  /**
   * Initialize SDK only when token is available.
   * If no token yet, use a minimal config to prevent errors.
   */
  const streamValue = useTypedStream({
    ...(streamConfig ?? {
      apiUrl,
      apiKey: undefined,
      assistantId,
      threadId: null,
      timeoutMs: 15000,
    }),
    fetchStateHistory: streamConfig !== null, // Only fetch history when authenticated
    onMetadataEvent: (data: { run_id?: string }) => {
      if (data.run_id) {
        setCurrentRunId(data.run_id);
      }
    },
    onCustomEvent: (event: unknown, options: { mutate: (fn: (prev: GraphState) => GraphState) => void }) => {
      // Handle UI messages
      if (isUIMessage(event) || isRemoveUIMessage(event)) {
        options.mutate((prev: GraphState) => {
          const ui = uiMessageReducer(prev.ui ?? [], event);
          return { ...prev, ui };
        });
      }

      // Handle error events from stream
      if (event && typeof event === "object" && "type" in event) {
        if (event.type === "error") {
          const errorMessage =
            "message" in event && typeof event.message === "string"
              ? event.message
              : "Stream error occurred";

          reportStreamError(new Error(errorMessage), {
            operation: "stream_event",
            component: "StreamSession",
            skipNotification: true, // Error boundary will handle notification
            additionalData: {
              eventType: event.type,
              assistantId,
              threadId,
              runId: currentRunId,
            },
          });
        }
      }
    },
    onError: (error: unknown) => {
      // Report general SDK errors to Sentry
      const err = error instanceof Error ? error : new Error(String(error));
      reportStreamError(err, {
        operation: "stream_general",
        component: "StreamSession",
        additionalData: {
          assistantId,
          threadId,
          currentRunId,
        },
      });
    },
    onThreadId: (id: string) => {
      setThreadId(id);

      /**
       * Thread already added to sidebar via optimistic update.
       * No need to fetch entire thread list - thread should already be visible.
       * If we wanted to sync with server, we could optionally fetch this specific thread.
       *
       * Note: We removed the 4-second delay that was causing poor UX.
       * The optimistic thread creation provides instant feedback.
       */

      // Optional: Verify thread was created successfully on server
      // This is a background operation and doesn't block the UI
      const verifyThreadCreation = async () => {
        try {
          // Brief delay to let the backend process the request
          await sleep(500);

          // Fetch updated threads to sync with server
          const threads = await getThreads();
          setThreads(threads);

          // Log successful thread creation
          logger.info("Thread created successfully", {
            operation: "thread_creation_confirmed",
            threadId: id,
          });
        } catch (error: unknown) {
          // If verification fails, remove the optimistic thread and show error
          if (error instanceof Error) {
            logger.error(error, {
              operation: "thread_creation_failed",
              threadId: id,
            });

            // Remove the optimistic thread from sidebar
            removeOptimisticThread(id);

            // Show error toast to user
            toast.error("Failed to create conversation", {
              description: "Please try sending your message again.",
            });
          }
        }
      };

      verifyThreadCreation();
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    const checkStatus = async () => {
      try {
        const ok = await checkGraphStatus(apiUrl, null, controller.signal);

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
      if (threadFetchControllerRef.current) {
        threadFetchControllerRef.current.abort();
      }
    };
  }, [apiUrl, logger]);

  /**
   * Clear stream error state
   */
  const clearError = useCallback(() => {
    setStreamError(null);
  }, []);

  /**
   * Retry stream by refreshing token and clearing error state
   */
  const retryStream = useCallback(async () => {
    setStreamError(null);
    // Re-fetch token to ensure it's fresh
    setAccessToken(null);
    // Token fetch will trigger automatically via useEffect
  }, []);

  const extendedStreamValue = useMemo(() => {
    // Avoid spreading streamValue because it exposes getters (e.g. history)
    // that throw when fetchStateHistory is false.
    const base = Object.create(streamValue);
    return Object.assign(base, {
      currentRunId,
      threadId,
      error: streamError,
      clearError,
      retryStream,
    });
  }, [streamValue, currentRunId, threadId, streamError, clearError, retryStream]);

  if (isUserLoading || (!accessToken && !tokenError && user)) {
    return (
      <StreamContext.Provider value={extendedStreamValue}>
        <LoadingScreen />
      </StreamContext.Provider>
    );
  }

  if (tokenError) {
    return (
      <StreamContext.Provider value={extendedStreamValue}>
        <div className="bg-background flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
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
        </div>
      </StreamContext.Provider>
    );
  }

  return (
    <StreamContext.Provider value={extendedStreamValue}>
      {children}
    </StreamContext.Provider>
  );
};
