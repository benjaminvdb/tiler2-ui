import { useMemo, useState, useCallback } from "react";
import { useTypedStream, GraphState } from "../types";
import {
  uiMessageReducer,
  isUIMessage,
  isRemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { reportStreamError } from "@/core/services/observability";

const STREAM_TIMEOUT_MS = 15000;

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

function handleCustomEvent(
  event: unknown,
  options: { mutate: (fn: (prev: GraphState) => GraphState) => void },
  assistantId: string,
  threadId: string | null,
  currentRunId: string | null,
) {
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
}

interface UseStreamSetupProps {
  apiUrl: string;
  assistantId: string;
  threadId: string | null;
  accessToken: string | null;
  verifyThreadCreation: (id: string) => Promise<void>;
  setThreadId: (id: string | null) => void;
}

/**
 * Hook to set up stream configuration and initialization
 */
export function useStreamSetup({
  apiUrl,
  assistantId,
  threadId,
  accessToken,
  verifyThreadCreation,
  setThreadId,
}: UseStreamSetupProps) {
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<Error | null>(null);

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

  const shouldFetchHistory = streamConfig !== null;

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
      handleCustomEvent(event, options, assistantId, threadId, currentRunId);
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

  const clearError = useCallback(() => {
    setStreamError(null);
  }, []);

  const retryStream = useCallback(async () => {
    setStreamError(null);
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

  return extendedStreamValue;
}
