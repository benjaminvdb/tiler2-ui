/**
 * AG-UI Event Handlers
 *
 * Extracted event handler factories to reduce complexity in useAGUIAgent hook.
 */

import type { AgentSubscriber, ToolCall } from "@ag-ui/client";
import type { UIMessage } from "../ag-ui-types";
import {
  aguiToUIMessage,
  createPlaceholderAIMessage,
} from "../message-adapter";
import { reportStreamError } from "@/core/services/observability";

interface EventHandlerContext {
  threadId: string | null;
  assistantId: string;
  onThreadId?: ((id: string) => void) | undefined;
}

interface EventHandlerRefs {
  currentMessageIdRef: React.MutableRefObject<string | null>;
  textBufferRef: React.MutableRefObject<string>;
  toolCallArgsRef: React.MutableRefObject<Map<string, string>>;
}

interface EventHandlerSetters {
  setMessages: React.Dispatch<React.SetStateAction<UIMessage[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
  setCurrentRunId: React.Dispatch<React.SetStateAction<string | null>>;
}

function createRunEventHandlers(
  setters: EventHandlerSetters,
  refs: EventHandlerRefs,
  context: EventHandlerContext,
  optimisticMessages: UIMessage[],
): Pick<
  AgentSubscriber,
  | "onRunInitialized"
  | "onRunStartedEvent"
  | "onRunFinishedEvent"
  | "onRunFailed"
  | "onRunErrorEvent"
> {
  const { setMessages, setIsLoading, setError, setCurrentRunId } = setters;
  const { currentMessageIdRef, textBufferRef, toolCallArgsRef } = refs;
  const { threadId, assistantId } = context;

  return {
    onRunInitialized: () => {
      setIsLoading(true);
      setError(null);
      setMessages(optimisticMessages);
    },

    onRunStartedEvent: ({ event }) => {
      setCurrentRunId(event.runId);
    },

    onRunFinishedEvent: () => {
      setIsLoading(false);
      currentMessageIdRef.current = null;
      textBufferRef.current = "";
      toolCallArgsRef.current.clear();
    },

    onRunFailed: ({ error: runError }) => {
      const err =
        runError instanceof Error ? runError : new Error(String(runError));
      setError(err);
      setIsLoading(false);
      reportStreamError(err, {
        operation: "ag_ui_stream",
        component: "useAGUIAgent",
        additionalData: { threadId, assistantId },
      });
    },

    onRunErrorEvent: ({ event }) => {
      const err = new Error(event.message || "Stream error occurred");
      setError(err);
      setIsLoading(false);
      reportStreamError(err, {
        operation: "ag_ui_stream_event",
        component: "useAGUIAgent",
        additionalData: { threadId, assistantId },
      });
    },
  };
}

function createTextMessageHandlers(
  setMessages: React.Dispatch<React.SetStateAction<UIMessage[]>>,
  refs: EventHandlerRefs,
): Pick<
  AgentSubscriber,
  | "onTextMessageStartEvent"
  | "onTextMessageContentEvent"
  | "onTextMessageEndEvent"
> {
  const { currentMessageIdRef, textBufferRef } = refs;

  return {
    onTextMessageStartEvent: ({ event }) => {
      currentMessageIdRef.current = event.messageId;
      textBufferRef.current = "";
      const placeholder = createPlaceholderAIMessage(event.messageId);
      setMessages((prev) => [...prev, placeholder]);
    },

    onTextMessageContentEvent: ({ textMessageBuffer }) => {
      textBufferRef.current = textMessageBuffer;
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.id !== currentMessageIdRef.current) return prev;
        return [
          ...prev.slice(0, -1),
          { ...lastMsg, content: textMessageBuffer },
        ];
      });
    },

    onTextMessageEndEvent: ({ textMessageBuffer }) => {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.id !== currentMessageIdRef.current) return prev;
        return [
          ...prev.slice(0, -1),
          { ...lastMsg, content: textMessageBuffer },
        ];
      });
    },
  };
}

function createToolCallHandlers(
  setMessages: React.Dispatch<React.SetStateAction<UIMessage[]>>,
  toolCallArgsRef: React.MutableRefObject<Map<string, string>>,
): Pick<
  AgentSubscriber,
  | "onToolCallStartEvent"
  | "onToolCallArgsEvent"
  | "onToolCallEndEvent"
  | "onToolCallResultEvent"
> {
  return {
    onToolCallStartEvent: ({ event }) => {
      toolCallArgsRef.current.set(event.toolCallId, "");
    },

    onToolCallArgsEvent: ({ event, toolCallBuffer, toolCallName }) => {
      toolCallArgsRef.current.set(event.toolCallId, toolCallBuffer);

      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.type !== "ai") return prev;

        const existingCalls = lastMsg.tool_calls ?? [];
        const existingIndex = existingCalls.findIndex(
          (tc) => tc.id === event.toolCallId,
        );

        const newToolCall: ToolCall = {
          id: event.toolCallId,
          type: "function",
          function: { name: toolCallName, arguments: toolCallBuffer },
        };

        const updatedCalls =
          existingIndex >= 0
            ? existingCalls.map((tc, i) =>
                i === existingIndex ? newToolCall : tc,
              )
            : [...existingCalls, newToolCall];

        return [...prev.slice(0, -1), { ...lastMsg, tool_calls: updatedCalls }];
      });
    },

    onToolCallEndEvent: ({ event, toolCallName, toolCallArgs }) => {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.type !== "ai") return prev;

        const existingCalls = lastMsg.tool_calls ?? [];
        const existingIndex = existingCalls.findIndex(
          (tc) => tc.id === event.toolCallId,
        );
        if (existingIndex < 0) return prev;

        const updatedCalls = existingCalls.map((tc, i) =>
          i === existingIndex
            ? {
                id: event.toolCallId,
                type: "function" as const,
                function: {
                  name: toolCallName,
                  arguments: JSON.stringify(toolCallArgs),
                },
              }
            : tc,
        );

        return [...prev.slice(0, -1), { ...lastMsg, tool_calls: updatedCalls }];
      });

      toolCallArgsRef.current.delete(event.toolCallId);
    },

    onToolCallResultEvent: ({ event }) => {
      const resultContent = event.content;
      const toolMessage: UIMessage = {
        id: `tool-result-${event.toolCallId}`,
        type: "tool",
        content:
          typeof resultContent === "string"
            ? resultContent
            : JSON.stringify(resultContent),
        tool_call_id: event.toolCallId,
      };
      setMessages((prev) => [...prev, toolMessage]);
    },
  };
}

function createSnapshotAndCustomHandlers(
  setMessages: React.Dispatch<React.SetStateAction<UIMessage[]>>,
  onThreadId?: (id: string) => void,
): Pick<AgentSubscriber, "onMessagesSnapshotEvent" | "onCustomEvent"> {
  return {
    onMessagesSnapshotEvent: ({ event }) => {
      const uiMessages = event.messages.map(aguiToUIMessage);
      setMessages(uiMessages);
    },

    onCustomEvent: ({ event }) => {
      if (event.name === "thread_id" && event.value && onThreadId) {
        onThreadId(event.value as string);
      }
    },
  };
}

export function createAgentSubscriber(
  setters: EventHandlerSetters,
  refs: EventHandlerRefs,
  context: EventHandlerContext,
  optimisticMessages: UIMessage[],
): AgentSubscriber {
  return {
    ...createRunEventHandlers(setters, refs, context, optimisticMessages),
    ...createTextMessageHandlers(setters.setMessages, refs),
    ...createToolCallHandlers(setters.setMessages, refs.toolCallArgsRef),
    ...createSnapshotAndCustomHandlers(setters.setMessages, context.onThreadId),
  };
}
