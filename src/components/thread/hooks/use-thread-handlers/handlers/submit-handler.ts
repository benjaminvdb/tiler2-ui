import { FormEvent } from "react";
import { ensureToolCallsHaveResponses } from "@/lib/ensure-tool-responses";
import { buildHumanMessage, buildInterruptResponse } from "../utils/message-builder";
import { UseThreadHandlersProps } from "../types";

export function createSubmitHandler(
  props: UseThreadHandlersProps,
  stream: any,
  isLoading: boolean
) {
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
      stream.submit(undefined, {
        command: {
          resume: response,
        },
      });

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
      Object.keys(artifactContext).length > 0 ? artifactContext : undefined;

    stream.submit(
      { messages: [...toolMessages, newHumanMessage], context },
      {
        streamMode: ["values"],
        optimisticValues: (prev: any) => ({
          ...prev,
          context,
          messages: [
            ...(prev.messages ?? []),
            ...toolMessages,
            newHumanMessage,
          ],
        }),
      },
    );

    setInput("");
    setContentBlocks([]);
  };
}