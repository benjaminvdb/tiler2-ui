import { useSearchParamState } from "@/core/routing/hooks";
import type { UIMessage, ToolCall } from "@/core/providers/stream/ag-ui-types";
import { useStreamContext } from "@/core/providers/stream";
import { getContentString } from "../../../../utils";
import { parseAnthropicStreamedToolCalls } from "../../utils";

/**
 * Check if message has tool calls with content
 */
const checkToolCallsStatus = (message: UIMessage) => {
  const hasToolCalls =
    "tool_calls" in message &&
    message.tool_calls &&
    message.tool_calls.length > 0;

  const toolCallsHaveContents =
    hasToolCalls &&
    message.tool_calls?.some((tc: ToolCall) => {
      // Handle both AG-UI format (function.arguments) and LangChain format (args)
      if ("function" in tc && tc.function?.arguments) {
        try {
          const args = JSON.parse(tc.function.arguments);
          return Object.keys(args).length > 0;
        } catch {
          return false;
        }
      }
      return false;
    });

  return { hasToolCalls, toolCallsHaveContents };
};

export function useMessageContent(message: UIMessage) {
  const content = message?.content ?? [];
  const contentString = getContentString(content);
  const [hideToolCallsParam] = useSearchParamState("hideToolCalls");

  const envDefaultHide = import.meta.env.VITE_HIDE_TOOL_CALLS !== "false";
  const hideToolCalls =
    hideToolCallsParam !== null ? hideToolCallsParam === true : envDefaultHide;

  const thread = useStreamContext();

  const anthropicStreamedToolCalls = Array.isArray(content)
    ? parseAnthropicStreamedToolCalls(content)
    : undefined;

  const { hasToolCalls, toolCallsHaveContents } = checkToolCallsStatus(message);
  const hasAnthropicToolCalls = !!anthropicStreamedToolCalls?.length;
  const isToolResult = message?.type === "tool";

  return {
    contentString,
    hideToolCalls,
    thread,
    anthropicStreamedToolCalls,
    hasToolCalls,
    toolCallsHaveContents,
    hasAnthropicToolCalls,
    isToolResult,
  };
}
