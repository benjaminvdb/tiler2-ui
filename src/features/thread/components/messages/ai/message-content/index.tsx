import type { UIMessage } from "@/core/providers/stream/stream-types";
import { useMessageContent } from "./hooks/use-message-content";
import { RegularMessage } from "./components";

interface MessageContentProps {
  message: UIMessage;
  isLoading: boolean;
}
export const MessageContent: React.FC<MessageContentProps> = ({
  message,
  isLoading,
}) => {
  const { contentString, hideToolCalls, thread, hasToolCalls, toolParts } =
    useMessageContent(message);

  return (
    <div className="group mr-auto flex items-start gap-2">
      <div className="flex flex-col gap-2">
        <RegularMessage
          message={message}
          isLoading={isLoading}
          contentString={contentString}
          hideToolCalls={hideToolCalls}
          hasToolCalls={hasToolCalls}
          toolParts={toolParts}
          thread={thread}
        />
      </div>
    </div>
  );
};
