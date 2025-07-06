import { Message, Checkpoint } from "@langchain/langgraph-sdk";
import { ToolResult } from "../../tool-calls";
import { useMessageContent } from "./hooks/use-message-content";
import { RegularMessage } from "./components";

interface MessageContentProps {
  message: Message;
  isLoading: boolean;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}

export function MessageContent({
  message,
  isLoading,
  handleRegenerate,
}: MessageContentProps) {
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

  return (
    <div className="group mr-auto flex items-start gap-2">
      <div className="flex flex-col gap-2">
        {isToolResult ? (
          <ToolResult message={message as any} />
        ) : (
          <RegularMessage
            message={message}
            isLoading={isLoading}
            contentString={contentString}
            hideToolCalls={hideToolCalls}
            hasToolCalls={!!hasToolCalls}
            toolCallsHaveContents={!!toolCallsHaveContents}
            hasAnthropicToolCalls={hasAnthropicToolCalls}
            anthropicStreamedToolCalls={anthropicStreamedToolCalls || []}
            meta={meta}
            thread={thread}
            parentCheckpoint={parentCheckpoint}
            handleRegenerate={handleRegenerate}
          />
        )}
      </div>
    </div>
  );
}
