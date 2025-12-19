import { useEffect } from "react";
import { toast } from "sonner";
import { useStreamContext } from "@/core/providers/stream";

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
  lastErrorRef,
  setFirstTokenReceived,
}: UseThreadEffectsProps) {
  const stream = useStreamContext();
  const messages = stream.messages;

  useEffect(() => {
    if (!stream.error) {
      lastErrorRef.current = undefined;
      return;
    }
    const message =
      (typeof stream.error === "object" && stream.error?.message) ||
      String(stream.error);

    if (!message || lastErrorRef.current === message) {
      return;
    }

    lastErrorRef.current = message;
    toast.error("An error occurred. Please try again.", {
      description: `Error: ${message}`,
      richColors: true,
      closeButton: true,
    });
  }, [stream.error, lastErrorRef]);

  useEffect(() => {
    const lastAiMessage = [...messages]
      .reverse()
      .find((message) => message.type === "ai");
    if (!lastAiMessage) {
      return;
    }

    const contentString = getMessageContentString(lastAiMessage.content);
    if (contentString.trim().length > 0) {
      setFirstTokenReceived(true);
    }
  }, [messages, setFirstTokenReceived]);
}
