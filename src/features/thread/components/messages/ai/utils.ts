import { jsonrepair } from "jsonrepair";
import type {
  ContentBlock,
  ToolCall,
} from "@/core/providers/stream/stream-types";

/**
 * Parse partial/incomplete JSON from streaming LLM output.
 * Uses jsonrepair to handle truncated JSON and returns an empty object on failure.
 */
function parsePartialJson(input: string): Record<string, unknown> {
  try {
    const repaired = jsonrepair(input);
    return JSON.parse(repaired) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Parse Anthropic-style tool calls from message content.
 * Converts Anthropic tool_use blocks to the ToolCall shape.
 */
export function parseAnthropicStreamedToolCalls(
  content: ContentBlock[],
): ToolCall[] {
  const toolCallContents = content.filter(
    (c) => c.type === "tool_use" && "id" in c,
  );

  return toolCallContents.map((tc) => {
    const toolCall = tc as Record<string, unknown>;
    let json: Record<string, unknown> = {};
    if (toolCall?.input) {
      json = parsePartialJson(toolCall.input as string);
    }
    // Convert to ToolCall shape.
    return {
      function: {
        name: (toolCall.name as string) ?? "",
        arguments: JSON.stringify(json),
      },
      type: "function" as const,
      id: (toolCall.id as string) ?? "",
    };
  });
}
