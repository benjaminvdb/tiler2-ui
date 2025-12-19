import { useRef } from "react";
import { CustomComponent } from "../../custom-component";
import { MessageText } from "./message-text";
import { ToolCallsSection } from "./tool-calls-section";
import { MessageActions } from "./message-actions";
import { SourcesList } from "../../sources-list";
import { renumberCitations } from "../../../../markdown/utils/citation-renumbering";
import { extractSourcesFromParts } from "../../utils";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import type {
  StreamContextType,
  UIMessage,
} from "@/core/providers/stream/stream-types";

interface RegularMessageProps {
  message: UIMessage;
  isLoading: boolean;
  contentString: string;
  hideToolCalls: boolean;
  hasToolCalls: boolean;
  toolParts: Array<ToolUIPart | DynamicToolUIPart>;
  thread: StreamContextType;
}

export const RegularMessage: React.FC<RegularMessageProps> = ({
  message,
  isLoading,
  contentString,
  hideToolCalls,
  hasToolCalls,
  toolParts,
  thread,
}) => {
  const htmlContainerRef = useRef<HTMLDivElement>(null);

  const sources = extractSourcesFromParts(message.parts);

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
        hideToolCalls={hideToolCalls}
        hasToolCalls={hasToolCalls}
        toolParts={toolParts}
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
