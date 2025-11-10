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
import { useTypedStream, StreamSessionProps, StepEvent } from "./types";
import { sleep, checkGraphStatus } from "./utils";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { useLogger } from "@/core/services/logging";
import * as Sentry from "@sentry/nextjs";

/**
 * Type guard to check if an event is a StepEvent.
 */
const isStepEvent = (event: unknown): event is StepEvent => {
  if (typeof event !== "object" || event === null) return false;
  if (!("event" in event) || !("step" in event)) return false;
  const stepEvent = event as StepEvent;
  return (
    stepEvent.event === "step_start" || stepEvent.event === "step_complete"
  );
};

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
   */
  useEffect(() => {
    if (!user || isUserLoading || accessToken) return;

    const fetchToken = async () => {
      try {
        const response = await fetch("/api/auth/token");

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
        setTokenError(err);
        setAccessToken(null);
      }
    };

    fetchToken();
  }, [user, isUserLoading, accessToken, logger]);

  const streamConfig = {
    apiUrl,
    apiKey: undefined,
    assistantId,
    threadId: threadId ?? null,
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
      if (data.run_id) {
        setCurrentRunId(data.run_id);
      }
    },
    onCustomEvent: (event, options) => {
      if (isUIMessage(event) || isRemoveUIMessage(event)) {
        logger.debug("UI message received", {
          operation: "custom_event",
          eventType: "ui_message",
        });
        options.mutate((prev) => {
          const ui = uiMessageReducer(prev.ui ?? [], event);
          return { ...prev, ui };
        });
      } else if (isStepEvent(event)) {
        // Handle assistant step events (tool calls, completions)
        logger.debug("Step event received", {
          operation: "custom_event",
          eventType: "step_event",
          stepEvent: event.event,
          stepId: event.step.step_id,
          action: event.step.action,
          status: event.step.status,
        });
        options.mutate((prev) => {
          const steps = prev.steps ?? [];
          if (event.event === "step_start") {
            logger.debug("Adding new step", {
              operation: "step_tracking",
              action: "step_start",
              stepCount: steps.length + 1,
              stepId: event.step.step_id,
            });
            // Add new step to list
            return { ...prev, steps: [...steps, event.step] };
          } else if (event.event === "step_complete") {
            logger.debug("Updating step completion", {
              operation: "step_tracking",
              action: "step_complete",
              stepId: event.step.step_id,
              newStatus: event.step.status,
            });
            // Update existing step
            return {
              ...prev,
              steps: steps.map((s) =>
                s.step_id === event.step.step_id ? event.step : s,
              ),
            };
          }
          return prev;
        });
      } else {
        logger.debug("Unknown custom event received", {
          operation: "custom_event",
          eventType: typeof event,
          event: JSON.stringify(event).substring(0, 100),
        });
      }
    },
    onThreadId: (id) => {
      setThreadId(id);

      if (threadFetchControllerRef.current) {
        threadFetchControllerRef.current.abort();
      }
      const controller = new AbortController();
      threadFetchControllerRef.current = controller;

      /**
       * Delay thread list refresh to allow backend to persist the new thread.
       */
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

  const extendedStreamValue = {
    ...streamValue,
    currentRunId,
    threadId,
  };

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
