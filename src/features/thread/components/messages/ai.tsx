import { memo } from "react";
import type { UIMessage } from "@/core/providers/stream/stream-types";
import { PlaceholderMessage } from "./ai/placeholder-message";
import { MessageContent } from "./ai/message-content";

interface AssistantMessageProps {
  message: UIMessage | undefined;
  isLoading: boolean;
}
export const AssistantMessage = memo(function AssistantMessage({
  message,
  isLoading,
}: AssistantMessageProps) {
  if (!message) {
    return <PlaceholderMessage />;
  }
  return (
    <MessageContent
      message={message}
      isLoading={isLoading}
    />
  );
});

export { AssistantMessageLoading } from "./ai/loading-message";
