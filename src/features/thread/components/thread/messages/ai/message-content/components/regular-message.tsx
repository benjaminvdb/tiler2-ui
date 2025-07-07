import { Message, Checkpoint } from "@langchain/langgraph-sdk";
import { CustomComponent } from "../../custom-component";
import { MessageText } from "./message-text";
import { ToolCallsSection } from "./tool-calls-section";
import { MessageActions } from "./message-actions";
import type { StreamContextType } from "@/core/providers/stream/types";
import type { MessageMetadata, JsonValue } from "@/shared/types";

interface RegularMessageProps {
  message: Message;
  isLoading: boolean;
  contentString: string;
  hideToolCalls: boolean;
  hasToolCalls: boolean;
  toolCallsHaveContents: boolean;
  hasAnthropicToolCalls: boolean;
  anthropicStreamedToolCalls?: JsonValue[];
  meta: MessageMetadata | null;
  thread: StreamContextType;
  parentCheckpoint: Checkpoint | null | undefined;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}
export const RegularMessage: React.FC<RegularMessageProps> = ({
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
}) => {
  return (
    <>
      <MessageText contentString={contentString} />
      <ToolCallsSection
        message={message}
        hideToolCalls={hideToolCalls}
        hasToolCalls={hasToolCalls}
        toolCallsHaveContents={toolCallsHaveContents}
        hasAnthropicToolCalls={hasAnthropicToolCalls}
        anthropicStreamedToolCalls={anthropicStreamedToolCalls as any}
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
};
