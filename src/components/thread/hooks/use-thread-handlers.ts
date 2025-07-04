import { FormEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { Checkpoint, Message } from "@langchain/langgraph-sdk";
import { ensureToolCallsHaveResponses } from "@/lib/ensure-tool-responses";
import { useStreamContext } from "@/providers/Stream";

interface UseThreadHandlersProps {
  input: string;
  setInput: (value: string) => void;
  contentBlocks: any[];
  setContentBlocks: (blocks: any[]) => void;
  isRespondingToInterrupt: boolean;
  setIsRespondingToInterrupt: (value: boolean) => void;
  currentInterrupt: any;
  setCurrentInterrupt: (value: any) => void;
  setFirstTokenReceived: (value: boolean) => void;
  artifactContext: any;
  prevMessageLength: React.MutableRefObject<number>;
}

export function useThreadHandlers({
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
  prevMessageLength,
}: UseThreadHandlersProps) {
  const stream = useStreamContext();
  const isLoading = stream.isLoading;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((input.trim().length === 0 && contentBlocks.length === 0) || isLoading)
      return;
    setFirstTokenReceived(false);

    // Check if we're responding to an interrupt
    if (isRespondingToInterrupt && currentInterrupt) {
      // Handle interrupt response
      const response = {
        type: "response",
        args: input.trim(),
      };

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
    const newHumanMessage: Message = {
      id: uuidv4(),
      type: "human",
      content: [
        ...(input.trim().length > 0 ? [{ type: "text", text: input }] : []),
        ...contentBlocks,
      ] as Message["content"],
    };

    const toolMessages = ensureToolCallsHaveResponses(stream.messages);

    const context =
      Object.keys(artifactContext).length > 0 ? artifactContext : undefined;

    stream.submit(
      { messages: [...toolMessages, newHumanMessage], context },
      {
        streamMode: ["values"],
        optimisticValues: (prev) => ({
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

  const handleRegenerate = (
    parentCheckpoint: Checkpoint | null | undefined,
  ) => {
    // Do this so the loading state is correct
    prevMessageLength.current = prevMessageLength.current - 1;
    setFirstTokenReceived(false);
    stream.submit(undefined, {
      checkpoint: parentCheckpoint,
      streamMode: ["values"],
    });
  };

  const handleActionClick = (prompt: string) => {
    stream.submit({ messages: prompt });
  };

  return {
    handleSubmit,
    handleRegenerate,
    handleActionClick,
  };
}