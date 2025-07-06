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

export function ToolCallsSection({
  message,
  hideToolCalls,
  hasToolCalls,
  toolCallsHaveContents,
  hasAnthropicToolCalls,
  anthropicStreamedToolCalls,
}: ToolCallsSectionProps) {
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
    </>
  );
}
