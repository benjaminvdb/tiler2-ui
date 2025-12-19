import { memo } from "react";
import type { Message } from "@copilotkit/shared";
import { PlaceholderMessage } from "./ai/placeholder-message";
import { MessageContent } from "./ai/message-content";

interface AssistantMessageProps {
  message: Message | undefined;
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
