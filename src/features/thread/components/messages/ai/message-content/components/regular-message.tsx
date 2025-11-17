import { Message, Checkpoint, AIMessage } from "@langchain/langgraph-sdk";
import { useRef } from "react";
import { CustomComponent } from "../../custom-component";
import { MessageText } from "./message-text";
import { ToolCallsSection } from "./tool-calls-section";
import { MessageActions } from "./message-actions";
import { SourcesList } from "../../sources-list";
import { renumberCitations } from "../../../../markdown/utils/citation-renumbering";
import type { StreamContextType } from "@/core/providers/stream/types";
import type { MessageMetadata } from "@/shared/types";

interface MessageMetadataWithBranch extends Partial<MessageMetadata> {
  branch?: string;
  branchOptions?: string[];
}

interface RegularMessageProps {
  message: Message;
  isLoading: boolean;
  contentString: string;
  hideToolCalls: boolean;
  hasToolCalls: boolean;
  toolCallsHaveContents: boolean;
  hasAnthropicToolCalls: boolean;
  anthropicStreamedToolCalls?: AIMessage["tool_calls"];
  meta: MessageMetadataWithBranch | null;
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
  const htmlContainerRef = useRef<HTMLDivElement>(null);

  const sources = thread.values?.sources || [];

  const { renumberedSources, renumberedContent } = renumberCitations(
    contentString,
    sources,
  );

  return (
    <>
      <MessageText
        contentString={renumberedContent}
        containerRef={htmlContainerRef}
      />
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
      <SourcesList sources={renumberedSources} />
      <MessageActions
        contentString={renumberedContent}
        htmlContainerRef={htmlContainerRef}
        isLoading={isLoading}
        meta={meta}
        thread={thread}
        parentCheckpoint={parentCheckpoint}
        handleRegenerate={handleRegenerate}
      />
    </>
  );
};
