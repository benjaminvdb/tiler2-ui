import { FormEvent } from "react";
import { Thread, type Message } from "@langchain/langgraph-sdk";
import { ensureToolCallsHaveResponses } from "@/features/thread/services/ensure-tool-responses";
import {
  buildHumanMessage,
  buildInterruptResponse,
} from "../utils/message-builder";
import { UseThreadHandlersProps } from "../types";
import type { StreamContextType } from "@/core/providers/stream/types";
import { generateThreadName } from "@/features/thread/utils/generate-thread-name";
import { buildOptimisticThread } from "@/features/thread/utils/build-optimistic-thread";

export const createSubmitHandler = (
  props: UseThreadHandlersProps,
  stream: StreamContextType,
  isLoading: boolean,
  addOptimisticThread: (thread: Thread) => void,
  userEmail: string,
) => {
  const {
    input,
    setInput,
    contentBlocks,
    setContentBlocks,
    isRespondingToInterrupt,
    setIsRespondingToInterrupt,
    currentInterrupt,
  setCurrentInterrupt,
  setFirstTokenReceived,
  artifactContext,
} = props;

  const submitInterruptResponse = () => {
    const response = buildInterruptResponse(input);
    stream.submit(null, {
      command: { resume: response },
    });
    setIsRespondingToInterrupt(false);
    setCurrentInterrupt(null);
    setInput("");
    setContentBlocks([]);
  };

  const baseSubmitOptions = (
    context: Record<string, unknown> | undefined,
    toolMessages: Message[],
    newHumanMessage: Message,
  ) => {
    const streamMode = ["values"] as ("values" | "messages" | "updates" | "debug" | "custom")[];
    return {
      streamMode,
      streamSubgraphs: true,
      optimisticValues: (prev: any) => ({
        ...prev,
        context,
        messages: [
          ...(Array.isArray(prev.messages) ? prev.messages : []),
          ...toolMessages,
          newHumanMessage,
        ],
      }),
    };
  };

  const createOptimisticThread = (threadName: string, message: Message) => {
    const optimisticThreadId = crypto.randomUUID();
    const optimisticThread = buildOptimisticThread({
      threadId: optimisticThreadId,
      threadName,
      userEmail,
      firstMessage: message,
    });

    addOptimisticThread(optimisticThread);

    return {
      optimisticThreadId,
      submitOverrides: {
        threadId: optimisticThreadId,
        metadata: { name: threadName },
      },
    };
  };

  return (e: FormEvent) => {
    e.preventDefault();
    if ((input.trim().length === 0 && contentBlocks.length === 0) || isLoading)
      return;
    setFirstTokenReceived(false);

    if (isRespondingToInterrupt && currentInterrupt) {
      submitInterruptResponse();
      return;
    }

    const newHumanMessage = buildHumanMessage(input, contentBlocks);
    const toolMessages = ensureToolCallsHaveResponses(stream.messages);
    const context =
      artifactContext && Object.keys(artifactContext).length > 0
        ? (artifactContext as Record<string, unknown>)
        : undefined;

    const submitData = {
      messages: [...toolMessages, newHumanMessage],
      ...(context ? { context } : {}),
    };

    let submitOptions = baseSubmitOptions(context, toolMessages, newHumanMessage);

    if (!stream.threadId && userEmail) {
      const threadName = generateThreadName({
        firstMessage: input,
      });
      const { submitOverrides } = createOptimisticThread(
        threadName,
        newHumanMessage,
      );
      submitOptions = { ...submitOptions, ...submitOverrides };
    }

    stream.submit(submitData, submitOptions);

    setInput("");
    setContentBlocks([]);
  };
};
