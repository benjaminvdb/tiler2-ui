import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import { useAuth0 } from "@auth0/auth0-react";
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
import { useObservability } from "@/core/services/observability";
import * as Sentry from "@sentry/react";
import { reportStreamError } from "@/core/services/observability";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";

const STREAM_TIMEOUT_MS = 15000;
const THREAD_SYNC_DELAY_MS = 500;

const isStreamErrorEvent = (
  event: unknown,
): event is { type: string; message?: string } =>
  Boolean(event && typeof event === "object" && "type" in event);

const reduceUiMessages = (
  event: unknown,
  mutate: (fn: (prev: GraphState) => GraphState) => void,
) => {
  if (isUIMessage(event) || isRemoveUIMessage(event)) {
    mutate((prev: GraphState) => {
      const ui = uiMessageReducer(prev.ui ?? [], event);
      return { ...prev, ui };
    });
  }
};

export const StreamSession: React.FC<StreamSessionProps> = ({
  children,
  apiUrl,
  assistantId,
}) => {
  const [threadId, setThreadId] = useSearchParamState("threadId");
  const { getThreads, setThreads, removeOptimisticThread } = useThreads();
  const threadFetchControllerRef = useRef<AbortController | null>(null);
  const { user, isLoading: isUserLoading } = useAuth0();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<Error | null>(null);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<Error | null>(null);

  const baseLogger = useObservability();
  const logger = useMemo(
    () =>
      baseLogger.child({
        component: "StreamSession",
        additionalData: {
          assistantId,
          apiUrl,
        },
      }),
    [baseLogger, assistantId, apiUrl],
  );

  const { getToken } = useAccessToken({
    component: "StreamSession",
    operation: "fetchAccessToken",
  });

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
   * Fetch access token on mount using Auth0 SDK.
   * Token is managed by Auth0 SDK with automatic refresh.
   */
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
      timeoutMs: STREAM_TIMEOUT_MS,
      defaultHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }, [accessToken, apiUrl, assistantId, threadId]);

  /**
   * Initialize SDK only when token is available.
   * If no token yet, use a minimal config to prevent errors.
   */
  const shouldFetchHistory = streamConfig !== null;

  const verifyThreadCreation = useCallback(
    async (id: string) => {
      try {
        await sleep(THREAD_SYNC_DELAY_MS);
        const threads = await getThreads();
        setThreads(threads);
        logger.info("Thread created successfully", {
          operation: "thread_creation_confirmed",
          threadId: id,
        });
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error, {
            operation: "thread_creation_failed",
            threadId: id,
          });
          removeOptimisticThread(id);
          toast.error("Failed to create conversation", {
            description: "Please try sending your message again.",
          });
        }
      }
    },
    [getThreads, logger, removeOptimisticThread, setThreads],
  );

  const streamValue = useTypedStream({
    ...(streamConfig ?? {
      apiUrl,
      apiKey: undefined,
      assistantId,
      threadId: null,
      timeoutMs: STREAM_TIMEOUT_MS,
    }),
    fetchStateHistory: shouldFetchHistory,
    onMetadataEvent: (data: { run_id?: string }) => {
      if (data.run_id) {
        setCurrentRunId(data.run_id);
      }
    },
    onCustomEvent: (
      event: unknown,
      options: { mutate: (fn: (prev: GraphState) => GraphState) => void },
    ) => {
      reduceUiMessages(event, options.mutate);

      if (isStreamErrorEvent(event) && event.type === "error") {
        const errorMessage =
          "message" in event && typeof event.message === "string"
            ? event.message
            : "Stream error occurred";

        reportStreamError(new Error(errorMessage), {
          operation: "stream_event",
          component: "StreamSession",
          skipNotification: true,
          additionalData: {
            eventType: event.type,
            assistantId,
            threadId,
            runId: currentRunId,
          },
        });
      }
    },
    onError: (error: unknown) => {
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
      verifyThreadCreation(id);
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
            additionalData: { apiUrl },
          });
        }
      }
    };

    checkStatus();

    return () => {
      controller.abort();
      const currentController = threadFetchControllerRef.current;
      if (currentController) {
        currentController.abort();
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
    setAccessToken(null);
  }, []);

  const extendedStreamValue = useMemo(() => {
    const base = Object.create(streamValue);
    return Object.assign(base, {
      currentRunId,
      threadId,
      error: streamError,
      clearError,
      retryStream,
    });
  }, [
    streamValue,
    currentRunId,
    threadId,
    streamError,
    clearError,
    retryStream,
  ]);

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
              type="button"
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
