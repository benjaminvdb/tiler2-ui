import { FormEvent } from "react";
import { buildHumanMessage } from "../utils/message-builder";
import { UseThreadHandlersProps } from "../types";
import type { UseCopilotChatReturn } from "@/core/providers/copilotkit";
import { generateThreadName } from "@/features/thread/utils/generate-thread-name";
import { buildOptimisticThread } from "@/features/thread/utils/build-optimistic-thread";
import type { Thread } from "@/features/thread/providers/thread-provider";

const buildContext = (
  artifactContext: Record<string, unknown> | undefined | null,
): Record<string, unknown> | undefined => {
  return artifactContext && Object.keys(artifactContext).length > 0
    ? artifactContext
    : undefined;
};

const createOptimisticThread = (
  threadName: string,
  messageContent: string,
  userEmail: string,
  addOptimisticThread: (thread: Thread) => void,
  threadId?: string,
) => {
  const optimisticThreadId = threadId || crypto.randomUUID();
  const optimisticThread = buildOptimisticThread({
    threadId: optimisticThreadId,
    threadName,
    userEmail,
    firstMessage: {
      id: crypto.randomUUID(),
      role: "user",
      content: messageContent,
    },
  });

  addOptimisticThread(optimisticThread);

  return {
    optimisticThreadId,
    threadName,
  };
};

/**
 * Creates the submit handler for the chat input.
 * Uses CopilotKit's submit interface with content and optional context.
 */
export const createSubmitHandler = (
  props: UseThreadHandlersProps,
  chat: UseCopilotChatReturn,
  isLoading: boolean,
  addOptimisticThread: (thread: Thread) => void,
  userEmail: string,
) => {
  const {
    input,
    setInput,
    contentBlocks,
    setContentBlocks,
    setFirstTokenReceived,
    artifactContext,
  } = props;

  return (e: FormEvent) => {
    e.preventDefault();
    if ((input.trim().length === 0 && contentBlocks.length === 0) || isLoading)
      return;
    setFirstTokenReceived(false);

    // Build the message content
    const newHumanMessage = buildHumanMessage(input, contentBlocks);
    const context = buildContext(artifactContext);

    // For new threads (first message), create optimistic thread for sidebar
    // Backend generates thread name from first message, so no metadata needed
    if (chat.messages.length === 0 && userEmail) {
      const threadName = generateThreadName({ firstMessage: input });
      createOptimisticThread(
        threadName,
        typeof newHumanMessage.content === "string"
          ? newHumanMessage.content
          : input,
        userEmail,
        addOptimisticThread,
        chat.threadId,
      );
    }

    // Submit using CopilotKit's interface
    // Backend generates thread name from first message, no metadata needed
    chat.submit({
      content: newHumanMessage.content,
      context,
    });

    setInput("");
    setContentBlocks([]);
  };
};
