import { Message } from "@langchain/langgraph-sdk";
import { CustomComponent } from "../../custom-component";
import { MessageText } from "./message-text";
import { ToolCallsSection } from "./tool-calls-section";
import { MessageActions } from "./message-actions";

interface RegularMessageProps {
  message: Message;
  isLoading: boolean;
  contentString: string;
  hideToolCalls: boolean;
  hasToolCalls: boolean;
  toolCallsHaveContents: boolean;
  hasAnthropicToolCalls: boolean;
  anthropicStreamedToolCalls?: any[];
  meta: any;
  thread: any;
  parentCheckpoint: any;
  handleRegenerate: (parentCheckpoint: any) => void;
}

export function RegularMessage({
  message,
  isLoading,
  contentString,
  hideToolCalls,
  hasToolCalls,
  toolCallsHaveContents,
  hasAnthropicToolCalls,
  anthropicStreamedToolCalls,
  meta,
  thread,
  parentCheckpoint,
  handleRegenerate,
}: RegularMessageProps) {
  return (
    <>
      <MessageText contentString={contentString} />
      <ToolCallsSection
        message={message}
        hideToolCalls={hideToolCalls}
        hasToolCalls={hasToolCalls}
        toolCallsHaveContents={toolCallsHaveContents}
        hasAnthropicToolCalls={hasAnthropicToolCalls}
        anthropicStreamedToolCalls={anthropicStreamedToolCalls}
      />
      <CustomComponent
        message={message}
        thread={thread}
      />
      <MessageActions
        contentString={contentString}
        isLoading={isLoading}
        meta={meta}
        thread={thread}
        parentCheckpoint={parentCheckpoint}
        handleRegenerate={handleRegenerate}
      />
    </>
  );
}
