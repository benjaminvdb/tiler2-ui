import { useEffect } from "react";
import { useCopilotChat } from "@/core/providers/copilotkit";

interface UseThreadEffectsProps {
  lastErrorRef: React.MutableRefObject<string | undefined>;
  setFirstTokenReceived: (value: boolean) => void;
}

/**
 * Get string content from a message content field.
 */
const getMessageContentString = (
  content: string | unknown[] | undefined,
): string => {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") return block;
        if (typeof block === "object" && block !== null && "text" in block) {
          return (block as { text: string }).text;
        }
        return "";
      })
      .join("");
  }
  return "";
};

export function useThreadEffects({
  lastErrorRef: _lastErrorRef,
  setFirstTokenReceived,
}: UseThreadEffectsProps) {
  const chat = useCopilotChat();
  const messages = chat.messages;

  // CopilotKit doesn't expose error directly via the hook
  // lastErrorRef is kept for interface compatibility but unused
  // Error handling would need to be done via different mechanisms if needed

  useEffect(() => {
    const lastMessage = messages?.[messages.length - 1];
    // AG-UI uses role: "assistant" instead of type: "ai"
    if (lastMessage?.role !== "assistant") {
      return;
    }

    const contentString = getMessageContentString(lastMessage.content);
    if (contentString.trim().length > 0) {
      setFirstTokenReceived(true);
    }
  }, [messages, setFirstTokenReceived]);
}
