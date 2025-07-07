import { ToolCalls } from "../../../tool-calls";
import { Message, AIMessage } from "@langchain/langgraph-sdk";

interface ToolCallsSectionProps {
  message: Message;
  hideToolCalls: boolean;
  hasToolCalls: boolean;
  toolCallsHaveContents: boolean;
  hasAnthropicToolCalls: boolean;
  anthropicStreamedToolCalls?: AIMessage["tool_calls"];
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
        <ToolCalls toolCalls={(message as AIMessage).tool_calls} />
      )) ||
        (hasAnthropicToolCalls && (
          <ToolCalls toolCalls={anthropicStreamedToolCalls} />
        )) ||
        (hasToolCalls && (
          <ToolCalls toolCalls={(message as AIMessage).tool_calls} />
        ))}
      ;
    </>
  );
};
