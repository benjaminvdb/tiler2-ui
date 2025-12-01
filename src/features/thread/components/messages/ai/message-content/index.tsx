import { Message, Checkpoint, ToolMessage } from "@langchain/langgraph-sdk";
import { ToolResult } from "../../tool-calls";
import { useMessageContent } from "./hooks/use-message-content";
import { RegularMessage } from "./components";

interface MessageContentProps {
  message: Message;
  isLoading: boolean;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}
export const MessageContent: React.FC<MessageContentProps> = ({
  message,
  isLoading,
  handleRegenerate,
}) => {
  const {
    contentString,
    hideToolCalls,
    thread,
    meta,
    parentCheckpoint,
    anthropicStreamedToolCalls,
    hasToolCalls,
    toolCallsHaveContents,
    hasAnthropicToolCalls,
    isToolResult,
  } = useMessageContent(message);

  if (isToolResult && hideToolCalls) {
    return null;
  }

  // Check if tool calls will actually be visible (not hidden by user preference)
  const hasVisibleToolCalls =
    (hasToolCalls || hasAnthropicToolCalls) && !hideToolCalls;

  // Filter out messages with no visible content (empty text + no visible tool calls)
  if (
    !isToolResult &&
    contentString.trim().length === 0 &&
    !hasVisibleToolCalls
  ) {
    return null;
  }
  return (
    <div className="group mr-auto flex items-start gap-2">
      <div className="flex flex-col gap-2">
        {isToolResult ? (
          <ToolResult message={message as ToolMessage} />
        ) : (
          <RegularMessage
            message={message}
            isLoading={isLoading}
            contentString={contentString}
            hideToolCalls={hideToolCalls}
            hasToolCalls={!!hasToolCalls}
            toolCallsHaveContents={!!toolCallsHaveContents}
            hasAnthropicToolCalls={hasAnthropicToolCalls}
            anthropicStreamedToolCalls={anthropicStreamedToolCalls}
            meta={
              (meta as unknown as {
                branch?: string;
                branchOptions?: string[];
              }) || null
            }
            thread={thread}
            parentCheckpoint={parentCheckpoint}
            handleRegenerate={handleRegenerate}
          />
        )}
      </div>
    </div>
  );
};
