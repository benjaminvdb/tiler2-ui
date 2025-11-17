import { parsePartialJson } from "@langchain/core/output_parsers";
import { AIMessage } from "@langchain/langgraph-sdk";
import { MessageContentComplex } from "@langchain/core/messages";

export function parseAnthropicStreamedToolCalls(
  content: MessageContentComplex[],
): AIMessage["tool_calls"] {
  const toolCallContents = content.filter((c) => c.type === "tool_use" && c.id);

  return toolCallContents.map((tc) => {
    const toolCall = tc as Record<string, unknown>;
    let json: Record<string, unknown> = {};
    if (toolCall?.input) {
      try {
        json = parsePartialJson(toolCall.input as string) ?? {};
      } catch {
        json = {};
      }
    }
    return {
      name: (toolCall.name as string) ?? "",
      id: (toolCall.id as string) ?? "",
      args: json,
      type: "tool_call" as const,
    };
  });
}
