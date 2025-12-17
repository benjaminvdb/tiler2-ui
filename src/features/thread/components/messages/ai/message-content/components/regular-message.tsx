import { useRef } from "react";
import { MessageText } from "./message-text";
import { ToolCallsSection } from "./tool-calls-section";
import { MessageActions } from "./message-actions";
import { SourcesList } from "../../sources-list";
import { renumberCitations } from "../../../../markdown/utils/citation-renumbering";
import type { Message, ToolCall, AIMessage } from "@copilotkit/shared";
import type { UseCopilotChatReturn } from "@/core/providers/copilotkit";

interface RegularMessageProps {
  message: Message;
  isLoading: boolean;
  contentString: string;
  hideToolCalls: boolean;
  hasToolCalls: boolean;
  toolCallsHaveContents: boolean;
  hasAnthropicToolCalls: boolean;
  anthropicStreamedToolCalls?: ToolCall[] | undefined;
  chat: UseCopilotChatReturn;
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
  chat,
}) => {
  const htmlContainerRef = useRef<HTMLDivElement>(null);

  // Sources can be passed via message state in AG-UI
  // TODO: Extract sources from agent state when available
  const sources = (message as AIMessage).state?.sources || [];

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
      <SourcesList sources={renumberedSources} />
      <MessageActions
        contentString={renumberedContent}
        htmlContainerRef={htmlContainerRef}
        isLoading={isLoading}
        chat={chat}
      />
    </>
  );
};
