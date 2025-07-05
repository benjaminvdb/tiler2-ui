import { Thread } from "@langchain/langgraph-sdk";
import { getContentString } from "../../utils";

export function extractThreadDisplayText(thread: Thread): string {
  let itemText = thread.thread_id;

  if (
    typeof thread.values === "object" &&
    thread.values &&
    "messages" in thread.values &&
    Array.isArray(thread.values.messages) &&
    thread.values.messages?.length > 0
  ) {
    const firstMessage = thread.values.messages[0];
    itemText = getContentString(firstMessage.content);
  }

  return itemText;
}
