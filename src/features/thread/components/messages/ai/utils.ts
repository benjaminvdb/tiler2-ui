import { jsonrepair } from "jsonrepair";
import type { ToolCall } from "@copilotkit/shared";

/**
 * Anthropic tool_use content block type.
 * Anthropic's API returns tool calls as content blocks, not as AG-UI InputContent.
 */
interface AnthropicToolUseBlock {
  type: "tool_use";
  id: string;
  name?: string;
  input?: string;
}

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
 * Converts Anthropic tool_use blocks to AG-UI ToolCall format.
 */
export function parseAnthropicStreamedToolCalls(
  content: unknown[],
): ToolCall[] {
  const toolCallContents = content.filter(
    (c): c is AnthropicToolUseBlock =>
      typeof c === "object" &&
      c !== null &&
      "type" in c &&
      (c as { type: unknown }).type === "tool_use" &&
      "id" in c,
  );

  return toolCallContents.map((tc) => {
    let json: Record<string, unknown> = {};
    if (tc.input) {
      json = parsePartialJson(tc.input);
    }
    // Convert to AG-UI ToolCall format
    return {
      function: {
        name: tc.name ?? "",
        arguments: JSON.stringify(json),
      },
      type: "function" as const,
      id: tc.id,
    };
  });
}
