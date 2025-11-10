import { Thread } from "@langchain/langgraph-sdk";
import { getContentString } from "@/features/thread/components/utils";

export const extractThreadDisplayText = (thread: Thread): string => {
  // Priority 1: Check for custom name in metadata
  if (
    thread.metadata &&
    typeof thread.metadata === "object" &&
    "name" in thread.metadata &&
    typeof thread.metadata.name === "string" &&
    thread.metadata.name.trim() !== ""
  ) {
    return thread.metadata.name.trim();
  }

  // Priority 2: Extract from first message
  if (
    typeof thread.values === "object" &&
    thread.values &&
    "messages" in thread.values &&
    Array.isArray(thread.values.messages) &&
    thread.values.messages?.length > 0
  ) {
    const firstMessage = thread.values.messages[0];
    return getContentString(firstMessage.content);
  }

  // Priority 3: Fall back to thread ID
  return thread.thread_id;
};
