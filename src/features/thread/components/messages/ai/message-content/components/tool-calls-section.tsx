import { ToolCalls } from "../../../tool-calls";
import type { UIMessage, ToolCall } from "@/core/providers/stream/stream-types";

interface ToolCallsSectionProps {
  message: UIMessage;
  hideToolCalls: boolean;
  hasToolCalls: boolean;
  toolCallsHaveContents: boolean;
  hasAnthropicToolCalls: boolean;
  anthropicStreamedToolCalls?: ToolCall[] | undefined;
}
export const ToolCallsSection: React.FC<ToolCallsSectionProps> = ({
  message,
  hideToolCalls,
  hasToolCalls,
  toolCallsHaveContents,
  hasAnthropicToolCalls,
  anthropicStreamedToolCalls,
}) => {
  if (hideToolCalls) {
    return null;
  }
  return (
    <>
      {(hasToolCalls && toolCallsHaveContents && (
        <ToolCalls toolCalls={message.tool_calls} />
      )) ||
        (hasAnthropicToolCalls && (
          <ToolCalls toolCalls={anthropicStreamedToolCalls} />
        )) ||
        (hasToolCalls && <ToolCalls toolCalls={message.tool_calls} />)}
    </>
  );
};
