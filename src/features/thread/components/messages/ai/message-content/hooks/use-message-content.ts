import { useQueryState, parseAsBoolean } from "nuqs";
import { Message } from "@langchain/langgraph-sdk";
import { useStreamContext } from "@/core/providers/stream";
import { getContentString } from "../../../../utils";
import { parseAnthropicStreamedToolCalls } from "../../utils";

export function useMessageContent(message: Message) {
  const content = message?.content ?? [];
  const contentString = getContentString(content);
  const [hideToolCalls] = useQueryState(
    "hideToolCalls",
    parseAsBoolean.withDefault(true),
  );

  const thread = useStreamContext();
  const meta = thread.getMessagesMetadata(message);
  const parentCheckpoint = meta?.firstSeenState?.parent_checkpoint;

  const anthropicStreamedToolCalls = Array.isArray(content)
    ? parseAnthropicStreamedToolCalls(content)
    : undefined;

  const hasToolCalls =
    "tool_calls" in message &&
    message.tool_calls &&
    message.tool_calls.length > 0;
  const toolCallsHaveContents =
    hasToolCalls &&
    message.tool_calls?.some(
      (tc) => tc.args && Object.keys(tc.args).length > 0,
    );
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
