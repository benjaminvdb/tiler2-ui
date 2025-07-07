import { FormEvent } from "react";
import { ensureToolCallsHaveResponses } from "@/lib/ensure-tool-responses";
import {
  buildHumanMessage,
  buildInterruptResponse,
} from "../utils/message-builder";
import { UseThreadHandlersProps } from "../types";
import { JsonValue } from "@/types";
import type { StreamContextType } from "@/providers/stream/types";

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
      artifactContext && Object.keys(artifactContext).length > 0
        ? artifactContext as Record<string, unknown>
        : undefined;

    const submitData: {
      messages: any[];
      context?: Record<string, unknown>;
    } = { messages: [...toolMessages, newHumanMessage] };
    
    if (context) {
      submitData.context = context;
    }

    stream.submit(
      submitData,
      {
        streamMode: ["values"],
        optimisticValues: (prev: Record<string, JsonValue>) => ({
          ...prev,
          context,
          messages: [
            ...(Array.isArray(prev.messages) ? prev.messages : []),
            ...toolMessages,
            newHumanMessage,
          ],
        }),
      },
    );

    setInput("");
    setContentBlocks([]);
  };
};
