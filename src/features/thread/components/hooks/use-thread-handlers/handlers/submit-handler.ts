import { FormEvent } from "react";
import { ensureToolCallsHaveResponses } from "@/features/thread/services/ensure-tool-responses";
import { buildHumanMessage } from "../utils/message-builder";
import { UseThreadHandlersProps } from "../types";
import type {
  StreamContextType,
  GraphState,
  UIMessage,
} from "@/core/providers/stream/ag-ui-types";
import { generateThreadName } from "@/features/thread/utils/generate-thread-name";
import { buildOptimisticThread } from "@/features/thread/utils/build-optimistic-thread";

// Thread type for optimistic thread creation
interface Thread {
  thread_id: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
  status: string;
  values: Record<string, unknown>;
}

const buildContext = (
  artifactContext: Record<string, unknown> | undefined | null,
): Record<string, unknown> | undefined => {
  return artifactContext && Object.keys(artifactContext).length > 0
    ? artifactContext
    : undefined;
};

const buildSubmitData = (
  toolMessages: UIMessage[],
  newHumanMessage: UIMessage,
  context: Record<string, unknown> | undefined,
) => ({
  messages: [...toolMessages, newHumanMessage],
  ...(context ? { context } : {}),
});

const baseSubmitOptions = (
  toolMessages: UIMessage[],
  newHumanMessage: UIMessage,
) => {
  return {
    optimisticValues: (prev: GraphState) => ({
      ...prev,
      messages: [
        ...(Array.isArray(prev.messages) ? prev.messages : []),
        ...toolMessages,
        newHumanMessage,
      ],
    }),
  };
};

const createOptimisticThread = (
  threadName: string,
  message: UIMessage,
  userEmail: string,
  addOptimisticThread: (thread: Thread) => void,
) => {
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
    setFirstTokenReceived,
    artifactContext,
  } = props;

  return (e: FormEvent) => {
    e.preventDefault();
    if ((input.trim().length === 0 && contentBlocks.length === 0) || isLoading)
      return;
    setFirstTokenReceived(false);

    const newHumanMessage = buildHumanMessage(input, contentBlocks);
    const toolMessages = ensureToolCallsHaveResponses(stream.messages);
    const context = buildContext(artifactContext);

    const submitData = buildSubmitData(toolMessages, newHumanMessage, context);
    let submitOptions = baseSubmitOptions(toolMessages, newHumanMessage);

    if (!stream.threadId && userEmail) {
      const threadName = generateThreadName({ firstMessage: input });
      const { submitOverrides } = createOptimisticThread(
        threadName,
        newHumanMessage,
        userEmail,
        addOptimisticThread,
      );
      submitOptions = { ...submitOptions, ...submitOverrides };
    }

    stream.submit(submitData, submitOptions);
    setInput("");
    setContentBlocks([]);
  };
};
