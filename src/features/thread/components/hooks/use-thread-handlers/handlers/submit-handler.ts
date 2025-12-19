import { FormEvent } from "react";
import { buildMessageFiles } from "../utils/message-builder";
import { UseThreadHandlersProps } from "../types";
import type { StreamContextType } from "@/core/providers/stream/stream-types";
import { generateThreadName } from "@/features/thread/utils/generate-thread-name";

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
  } = props;

  return (e: FormEvent) => {
    e.preventDefault();
    if ((input.trim().length === 0 && contentBlocks.length === 0) || isLoading)
      return;
    setFirstTokenReceived(false);

    const files = buildMessageFiles(contentBlocks);
    const hasText = input.trim().length > 0;

    const sendOptions: Parameters<typeof stream.sendMessage>[1] = {};

    if (!stream.threadId) {
      const threadName = generateThreadName({ firstMessage: input });
      sendOptions.metadata = { name: threadName };
    }

    if (hasText) {
      stream.sendMessage(
        {
          text: input,
          ...(files.length > 0 ? { files } : {}),
        },
        sendOptions,
      );
    } else if (files.length > 0) {
      stream.sendMessage({ files }, sendOptions);
    }

    setInput("");
    setContentBlocks([]);
  };
};
