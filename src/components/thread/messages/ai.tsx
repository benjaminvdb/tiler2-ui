import { Checkpoint, Message } from "@langchain/langgraph-sdk";
import { PlaceholderMessage } from "./ai/placeholder-message";
import { MessageContent } from "./ai/message-content";

interface AssistantMessageProps {
  message: Message | undefined;
  isLoading: boolean;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}

export function AssistantMessage({
  message,
  isLoading,
  handleRegenerate,
}: AssistantMessageProps) {
  // If this is the special placeholder AssistantMessage (no real message), mirror the current interrupt
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
}

export { AssistantMessageLoading } from "./ai/loading-message";
