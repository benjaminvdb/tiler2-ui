import { FormEvent } from "react";
import { buildHumanMessage } from "../utils/message-builder";
import { UseThreadHandlersProps } from "../types";
import type {
  StreamContextType,
  UIMessage,
} from "@/core/providers/stream/stream-types";
import { generateThreadName } from "@/features/thread/utils/generate-thread-name";

const buildContext = (
  artifactContext: Record<string, unknown> | undefined | null,
): Record<string, unknown> | undefined => {
  return artifactContext && Object.keys(artifactContext).length > 0
    ? artifactContext
    : undefined;
};

const buildSubmitData = (
  newHumanMessage: UIMessage,
  context: Record<string, unknown> | undefined,
) => ({
  messages: [newHumanMessage],
  ...(context ? { context } : {}),
});

export const createSubmitHandler = (
  props: UseThreadHandlersProps,
  stream: StreamContextType,
  isLoading: boolean,
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
    const context = buildContext(artifactContext);

    const submitData = buildSubmitData(newHumanMessage, context);
    const submitOptions: Parameters<typeof stream.submit>[1] = {};

    if (!stream.threadId) {
      const threadName = generateThreadName({ firstMessage: input });
      submitOptions.metadata = { name: threadName };
    }

    stream.submit(submitData, submitOptions);
    setInput("");
    setContentBlocks([]);
  };
};
