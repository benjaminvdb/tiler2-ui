import { FormEvent } from "react";
import { Thread } from "@langchain/langgraph-sdk";
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

  return (e: FormEvent) => {
    e.preventDefault();
    if ((input.trim().length === 0 && contentBlocks.length === 0) || isLoading)
      return;
    setFirstTokenReceived(false);

    // Check if we're responding to an interrupt
    if (isRespondingToInterrupt && currentInterrupt) {
      // Handle interrupt response
      const response = buildInterruptResponse(input);

      // Resume the stream with the interrupt response
      const interruptOptions: any = {
        command: {
          resume: response,
        },
      };

      stream.submit(null, interruptOptions);

      // Clear interrupt state
      setIsRespondingToInterrupt(false);
      setCurrentInterrupt(null);
      setInput("");
      setContentBlocks([]);
      return;
    }

    // Normal message submission
    const newHumanMessage = buildHumanMessage(input, contentBlocks);
    const toolMessages = ensureToolCallsHaveResponses(stream.messages);
    const context =
      artifactContext && Object.keys(artifactContext).length > 0
        ? (artifactContext as Record<string, unknown>)
        : undefined;

    const submitData: {
      messages: any[];
      context?: Record<string, unknown>;
    } = { messages: [...toolMessages, newHumanMessage] };

    if (context) {
      submitData.context = context;
    }

    // Check if this is the first message (no existing thread)
    const isFirstMessage = !stream.threadId;

    let submitOptions: any = {
      streamMode: ["values"],
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

    // If this is the first message, create optimistic thread
    if (isFirstMessage && userEmail) {
      // Generate pre-determined thread ID
      const optimisticThreadId = crypto.randomUUID();

      // Generate thread name from first message
      // TODO: Support workflow titles when workflow context is available
      const threadName = generateThreadName({
        firstMessage: input,
      });

      // Build optimistic thread object
      const optimisticThread = buildOptimisticThread({
        threadId: optimisticThreadId,
        threadName,
        userEmail,
        firstMessage: newHumanMessage,
      });

      // Add to sidebar immediately
      addOptimisticThread(optimisticThread);

      // Include threadId and metadata in submit options
      submitOptions = {
        ...submitOptions,
        threadId: optimisticThreadId,
        metadata: {
          name: threadName,
        },
      };
    }

    stream.submit(submitData, submitOptions);

    setInput("");
    setContentBlocks([]);
  };
};
