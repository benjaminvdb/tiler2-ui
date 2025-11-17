import { useSearchParamState } from "@/core/routing/hooks";
import { Message } from "@langchain/langgraph-sdk";
import { useStreamContext } from "@/core/providers/stream";
import { getContentString } from "../../../../utils";
import { parseAnthropicStreamedToolCalls } from "../../utils";

/**
 * Check if message has tool calls with content
 */
const checkToolCallsStatus = (message: Message) => {
  const hasToolCalls =
    "tool_calls" in message &&
    message.tool_calls &&
    message.tool_calls.length > 0;

  const toolCallsHaveContents =
    hasToolCalls &&
    message.tool_calls?.some(
      (tc) => tc.args && Object.keys(tc.args).length > 0,
    );

  return { hasToolCalls, toolCallsHaveContents };
};

export function useMessageContent(message: Message) {
  const content = message?.content ?? [];
  const contentString = getContentString(content);
  const [hideToolCallsParam] = useSearchParamState("hideToolCalls");

  const envDefaultHide = import.meta.env.VITE_HIDE_TOOL_CALLS !== "false";
  const hideToolCalls =
    hideToolCallsParam !== null ? hideToolCallsParam === true : envDefaultHide;

  const thread = useStreamContext();
  const meta = thread.getMessagesMetadata(message);
  const parentCheckpoint = meta?.firstSeenState?.parent_checkpoint;

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
    meta,
    parentCheckpoint,
    anthropicStreamedToolCalls,
    hasToolCalls,
    toolCallsHaveContents,
    hasAnthropicToolCalls,
    isToolResult,
  };
}
