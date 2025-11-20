import { useState } from "react";
import { useTypedStream, GraphState } from "../types";
import {
  uiMessageReducer,
  isUIMessage,
  isRemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { reportStreamError } from "@/core/services/observability";

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

  const streamConfig = accessToken
    ? {
        apiUrl,
        apiKey: undefined,
        assistantId,
        threadId: threadId ?? null,
        defaultHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    : null;

  const streamValue = useTypedStream({
    ...(streamConfig ?? {
      apiUrl,
      apiKey: undefined,
      assistantId,
      threadId: null,
    }),
    fetchStateHistory: streamConfig !== null,
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

  const clearError = () => {
    setStreamError(null);
  };

  const retryStream = async () => {
    setStreamError(null);
  };

  const base = Object.create(streamValue);
  return Object.assign(base, {
    currentRunId,
    threadId,
    error: streamError,
    clearError,
    retryStream,
  });
}
