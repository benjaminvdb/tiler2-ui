import { useRef } from "react";
import { CustomComponent } from "../../custom-component";
import { MessageText } from "./message-text";
import { ToolCallsSection } from "./tool-calls-section";
import { MessageActions } from "./message-actions";
import { SourcesList } from "../../sources-list";
import { renumberCitations } from "../../../../markdown/utils/citation-renumbering";
import type {
  StreamContextType,
  UIMessage,
  ToolCall,
} from "@/core/providers/stream/stream-types";

interface RegularMessageProps {
  message: UIMessage;
  isLoading: boolean;
  contentString: string;
  hideToolCalls: boolean;
  hasToolCalls: boolean;
  toolCallsHaveContents: boolean;
  hasAnthropicToolCalls: boolean;
  anthropicStreamedToolCalls?: ToolCall[] | undefined;
  thread: StreamContextType;
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
  thread,
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
        messageId={message.id}
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
        thread={thread}
        messageId={message.id}
      />
    </>
  );
};
