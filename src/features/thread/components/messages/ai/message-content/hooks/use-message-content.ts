/**
 * Extracts and processes message content including tool calls visibility logic.
 */

import { useSearchParamState } from "@/core/routing/hooks";
import { isToolOrDynamicToolUIPart } from "ai";
import type { UIMessage } from "@/core/providers/stream/stream-types";
import { useStreamContext } from "@/core/providers/stream";
import { getContentString } from "../../../../utils";

export function useMessageContent(message: UIMessage) {
  const parts = message?.parts ?? [];
  const contentString = getContentString(parts);
  const [hideToolCallsParam] = useSearchParamState("hideToolCalls");

  const envDefaultHide = import.meta.env.VITE_HIDE_TOOL_CALLS !== "false";
  const hideToolCalls =
    hideToolCallsParam !== null ? hideToolCallsParam === true : envDefaultHide;

  const thread = useStreamContext();

  const toolParts = Array.isArray(parts)
    ? parts.filter(isToolOrDynamicToolUIPart)
    : [];

  const hasToolCalls = toolParts.length > 0;

  return {
    contentString,
    hideToolCalls,
    thread,
    hasToolCalls,
    toolParts,
  };
}
