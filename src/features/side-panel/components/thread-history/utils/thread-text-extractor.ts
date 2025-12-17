import type { Thread } from "@/features/thread/providers/thread-provider";
import type { Message } from "@copilotkit/shared";
import { getContentString } from "@/features/thread/components/utils";

const extractMetadataName = (thread: Thread): string | null => {
  if (
    thread.metadata &&
    typeof thread.metadata === "object" &&
    "name" in thread.metadata &&
    typeof thread.metadata.name === "string"
  ) {
    const trimmed = thread.metadata.name.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
};

const extractFirstMessageText = (thread: Thread): string | null => {
  if (!thread.values || typeof thread.values !== "object") {
    return null;
  }

  const messages = (thread.values as { messages?: Array<Message> }).messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  return getContentString(messages[0].content);
};

export const extractThreadDisplayText = (thread: Thread): string => {
  const metadataName = extractMetadataName(thread);
  if (metadataName) {
    return metadataName;
  }

  const messageText = extractFirstMessageText(thread);
  if (messageText) {
    return messageText;
  }

  return thread.thread_id;
};
