import { memo } from "react";
import { Checkpoint, Message } from "@langchain/langgraph-sdk";
import { PlaceholderMessage } from "./ai/placeholder-message";
import { MessageContent } from "./ai/message-content";

interface AssistantMessageProps {
  message: Message | undefined;
  isLoading: boolean;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}
export const AssistantMessage = memo(function AssistantMessage({
  message,
  isLoading,
  handleRegenerate,
}: AssistantMessageProps) {
  if (!message) {
    return <PlaceholderMessage />;
  }
  return (
    <MessageContent
      message={message}
      isLoading={isLoading}
      handleRegenerate={handleRegenerate}
    />
  );
});

export { AssistantMessageLoading } from "./ai/loading-message";
