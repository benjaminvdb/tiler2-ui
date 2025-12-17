import { useSearchParamState } from "@/core/routing/hooks";
import type { Message, ToolCall, AIMessage } from "@copilotkit/shared";
import { useCopilotChat } from "@/core/providers/copilotkit";
import { getContentString } from "../../../../utils";
import { parseAnthropicStreamedToolCalls } from "../../utils";

/**
 * Check if message has tool calls with content.
 * AG-UI uses toolCalls (camelCase) on AssistantMessage.
 */
const checkToolCallsStatus = (message: Message) => {
  // AG-UI AssistantMessage has toolCalls (camelCase)
  const toolCalls = (message as AIMessage).toolCalls;
  const hasToolCalls = toolCalls && toolCalls.length > 0;

  const toolCallsHaveContents =
    hasToolCalls &&
    toolCalls?.some((tc: ToolCall) => {
      // AG-UI format: toolCall.function.arguments
      if (tc.function?.arguments) {
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

export function useMessageContent(message: Message) {
  const content = message?.content ?? "";
  const contentString = getContentString(content);
  const [hideToolCallsParam] = useSearchParamState("hideToolCalls");

  const envDefaultHide = import.meta.env.VITE_HIDE_TOOL_CALLS !== "false";
  const hideToolCalls =
    hideToolCallsParam !== null ? hideToolCallsParam === true : envDefaultHide;

  const chat = useCopilotChat();

  const anthropicStreamedToolCalls = Array.isArray(content)
    ? parseAnthropicStreamedToolCalls(content)
    : undefined;

  const { hasToolCalls, toolCallsHaveContents } = checkToolCallsStatus(message);
  const hasAnthropicToolCalls = !!anthropicStreamedToolCalls?.length;
  // AG-UI uses role: "tool" instead of type: "tool"
  const isToolResult = message?.role === "tool";

  return {
    contentString,
    hideToolCalls,
    chat,
    anthropicStreamedToolCalls,
    hasToolCalls,
    toolCallsHaveContents,
    hasAnthropicToolCalls,
    isToolResult,
  };
}
