/**
 * Custom hook that wraps CopilotKit's useCopilotChatHeadless_c.
 *
 * This provides a clean interface for chat components with:
 * - AG-UI Message format (role: "user" | "assistant" | "tool")
 * - submit() function for sending messages with custom config
 * - Thread management via CopilotKit's native threadId
 *
 * Migration from old UIMessage type:
 * - message.type "human" -> message.role "user"
 * - message.type "ai" -> message.role "assistant"
 * - message.type "tool" -> message.role "tool"
 */

import { useCallback, useMemo } from "react";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import type { Message } from "@copilotkit/shared";
import { v4 as uuidv4 } from "uuid";
import { useAuth0 } from "@auth0/auth0-react";
import type { InputContent } from "@ag-ui/core";

/**
 * Content block types for multimodal messages.
 * Uses AG-UI InputContent type for compatibility.
 */
export type ContentBlock = InputContent;

export interface UseCopilotChatOptions {
  /**
   * Custom chat instance id to share state across hook instances.
   */
  id?: string | undefined;
  /**
   * Initial messages to hydrate the chat (e.g., for existing threads).
   */
  initialMessages?: Message[] | undefined;
}

/**
 * Configuration for submitting messages.
 * These values are forwarded to the backend agent via AG-UI forwardedProps.
 */
export interface SubmitConfig {
  /**
   * Custom context to pass to the agent.
   * Sent via forwardedProps.context
   */
  context?: Record<string, unknown>;
  /**
   * Metadata for the request (e.g., thread name for new threads).
   * Sent via forwardedProps.metadata
   */
  metadata?: Record<string, unknown>;
  /**
   * Agent configuration parameters (workflow_id, task_id, etc.).
   * Sent via forwardedProps.configurable
   */
  configurable?: Record<string, unknown>;
  /**
   * Additional forwarded props to include in the run (advanced).
   */
  forwardedProps?: Record<string, unknown>;
}

/**
 * Data for submitting a message.
 */
export interface SubmitData {
  /**
   * The user message content.
   * Can be a string or array of content blocks for multimodal.
   */
  content: string | ContentBlock[];
  /**
   * Optional context to pass with the message.
   */
  context?: Record<string, unknown> | undefined;
}

/**
 * Return type for useCopilotChat hook.
 */
export interface UseCopilotChatReturn {
  /** Messages in AG-UI format */
  messages: Message[];
  /** Whether the agent is currently running */
  isLoading: boolean;
  /** Current thread ID (may be undefined before first message) */
  threadId: string | undefined;
  /** Submit a new message */
  submit: (data: SubmitData, config?: SubmitConfig) => Promise<void>;
  /** Stop the current generation */
  stop: () => void;
  /** Set messages directly */
  setMessages: (messages: Message[]) => void;
  /** Reset the chat */
  reset: () => void;
  /** Access to the underlying agent for advanced use */
  agent: ReturnType<typeof useCopilotChatHeadless_c>["agent"];
}

/**
 * Convert content to AG-UI-compatible content.
 */
function normalizeContent(
  content: string | ContentBlock[],
): string | ContentBlock[] {
  if (typeof content === "string") return content;
  return content;
}

function buildForwardedProps(config?: SubmitConfig): Record<string, unknown> {
  if (!config) return {};
  const forwarded: Record<string, unknown> = {};
  if (config.configurable) forwarded.configurable = config.configurable;
  if (config.context) forwarded.context = config.context;
  if (config.metadata) forwarded.metadata = config.metadata;
  if (config.forwardedProps) Object.assign(forwarded, config.forwardedProps);
  return forwarded;
}

/**
 * Custom hook that wraps CopilotKit's headless chat functionality.
 *
 * Provides a simplified interface for chat components with:
 * - submit() function that accepts content and optional config
 * - Messages in AG-UI format (use message.role instead of message.type)
 * - Automatic forwarding of context, metadata, and configurable to the agent
 */
export function useCopilotChat(
  options?: UseCopilotChatOptions,
): UseCopilotChatReturn {
  const headlessOptions: Parameters<typeof useCopilotChatHeadless_c>[0] = {
    ...(options?.id ? { id: options.id } : {}),
    ...(options?.initialMessages
      ? { initialMessages: options.initialMessages }
      : {}),
  };

  const {
    messages,
    sendMessage,
    setMessages,
    stopGeneration,
    reset,
    isLoading,
    threadId,
    agent,
  } = useCopilotChatHeadless_c(headlessOptions);

  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  /**
   * Submit a message to the chat agent.
   *
   * @param data - The message data with content and optional context
   * @param config - Optional configuration (configurable for tasks)
   */
  const submit = useCallback(
    async (data: SubmitData, config?: SubmitConfig) => {
      const messageContent = normalizeContent(data.content);

      // Build the user message in AG-UI format
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: messageContent,
      };

      const baseForwardedProps = buildForwardedProps(config);
      const hasForwardedProps = Object.keys(baseForwardedProps).length > 0;

      // Prefer the built-in sendMessage path when no forwarded props are needed
      if (!agent || !hasForwardedProps) {
        await sendMessage(userMessage);
        return;
      }

      const forwardedProps = { ...baseForwardedProps };

      // Include auth token in forwardedProps when available
      if (isAuthenticated) {
        try {
          const authToken = await getAccessTokenSilently();
          if (authToken) {
            forwardedProps.authorization = authToken;
          }
        } catch (error) {
          console.error(
            "Failed to fetch auth token for forwardedProps:",
            error,
          );
        }
      }

      agent.addMessage(userMessage);
      try {
        await agent.runAgent({ forwardedProps });
        // Ensure React state updates after the run
        setMessages([...agent.messages]);
      } catch (error) {
        console.error("agent.runAgent failed:", error);
        throw error;
      }
    },
    [sendMessage, agent, setMessages, getAccessTokenSilently, isAuthenticated],
  );

  const stop = useCallback(() => {
    if (agent) {
      agent.abortRun();
    } else {
      stopGeneration();
    }
  }, [agent, stopGeneration]);

  return useMemo(
    () => ({
      messages,
      isLoading,
      threadId,
      submit,
      stop,
      setMessages,
      reset,
      agent,
    }),
    [messages, isLoading, threadId, submit, stop, setMessages, reset, agent],
  );
}

/**
 * Re-export Message type for convenience.
 */
export type { Message };
