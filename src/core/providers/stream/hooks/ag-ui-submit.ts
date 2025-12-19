/**
 * AG-UI Submit Logic
 *
 * Extracted submit logic to reduce complexity in useAGUIAgent hook.
 */

import { HttpAgent } from "@ag-ui/client";
import type {
  UIMessage,
  SubmitData,
  SubmitConfig,
  GraphState,
} from "../ag-ui-types";
import { uiToAGUIMessage } from "../message-adapter";
import { createAgentSubscriber } from "./ag-ui-event-handlers";
import { reportStreamError } from "@/core/services/observability";

interface SubmitContext {
  apiUrl: string;
  threadId: string | null;
  assistantId: string;
  accessToken: string | null;
  messages: UIMessage[];
  onThreadId?: ((id: string) => void) | undefined;
}

interface SubmitRefs {
  agentRef: React.MutableRefObject<HttpAgent | null>;
  currentMessageIdRef: React.MutableRefObject<string | null>;
  textBufferRef: React.MutableRefObject<string>;
  toolCallArgsRef: React.MutableRefObject<Map<string, string>>;
}

interface SubmitSetters {
  setMessages: React.Dispatch<React.SetStateAction<UIMessage[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
  setCurrentRunId: React.Dispatch<React.SetStateAction<string | null>>;
}

function buildAgentConfig(
  apiUrl: string,
  accessToken: string,
  effectiveThreadId: string | null,
): { url: string; threadId?: string; headers: Record<string, string> } {
  const config: {
    url: string;
    threadId?: string;
    headers: Record<string, string>;
  } = {
    url: `${apiUrl}/agent/run`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  if (effectiveThreadId) {
    config.threadId = effectiveThreadId;
  }

  return config;
}

function buildOptimisticMessages(
  currentMessages: UIMessage[],
  data: SubmitData | null,
  config?: SubmitConfig,
): UIMessage[] {
  if (config?.optimisticValues) {
    const state: GraphState = { messages: currentMessages, sources: [] };
    return config.optimisticValues(state).messages;
  }
  if (data?.messages) {
    return [...currentMessages, ...data.messages];
  }
  return currentMessages;
}

function buildForwardedProps(
  data: SubmitData | null,
  config?: SubmitConfig,
): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  if (data?.context) props.context = data.context;
  if (config?.metadata) props.metadata = config.metadata;
  if (config?.config?.configurable)
    props.configurable = config.config.configurable;
  return props;
}

export function executeSubmit(
  context: SubmitContext,
  refs: SubmitRefs,
  setters: SubmitSetters,
  data: SubmitData | null,
  config?: SubmitConfig,
): void {
  const { apiUrl, threadId, assistantId, accessToken, messages, onThreadId } =
    context;
  const { agentRef, currentMessageIdRef, textBufferRef, toolCallArgsRef } =
    refs;
  const { setMessages, setIsLoading, setError, setCurrentRunId } = setters;

  if (!accessToken) {
    setError(new Error("No access token available"));
    return;
  }

  const effectiveThreadId = config?.threadId ?? threadId;
  const agentConfig = buildAgentConfig(apiUrl, accessToken, effectiveThreadId);
  const agent = new HttpAgent(agentConfig);
  agentRef.current = agent;

  const optimisticMessages = buildOptimisticMessages(messages, data, config);

  const subscriber = createAgentSubscriber(
    { setMessages, setIsLoading, setError, setCurrentRunId },
    { currentMessageIdRef, textBufferRef, toolCallArgsRef },
    { threadId, assistantId, onThreadId },
    optimisticMessages,
  );

  const aguiMessages = data?.messages ? data.messages.map(uiToAGUIMessage) : [];
  if (aguiMessages.length > 0) {
    agent.setMessages(aguiMessages);
  }

  const forwardedProps = buildForwardedProps(data, config);
  const runOptions =
    Object.keys(forwardedProps).length > 0 ? { forwardedProps } : {};

  agent.runAgent(runOptions, subscriber).catch((err: unknown) => {
    const error = err instanceof Error ? err : new Error(String(err));
    setError(error);
    setIsLoading(false);
    reportStreamError(error, {
      operation: "ag_ui_run",
      component: "useAGUIAgent",
      additionalData: { threadId, assistantId },
    });
  });
}
