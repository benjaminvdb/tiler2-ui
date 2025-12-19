import { ToolCalls } from "../../../tool-calls";
import type { Message, ToolCall, AIMessage } from "@copilotkit/shared";

interface ToolCallsSectionProps {
  message: Message;
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
  // AG-UI uses toolCalls (camelCase) on AIMessage
  const toolCalls = (message as AIMessage).toolCalls;
  return (
    <>
      {(hasToolCalls && toolCallsHaveContents && (
        <ToolCalls toolCalls={toolCalls} />
      )) ||
        (hasAnthropicToolCalls && (
          <ToolCalls toolCalls={anthropicStreamedToolCalls} />
        )) ||
        (hasToolCalls && <ToolCalls toolCalls={toolCalls} />)}
    </>
  );
};
