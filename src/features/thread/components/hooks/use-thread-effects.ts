import { useEffect } from "react";
import { toast } from "sonner";
import { useStreamContext } from "@/core/providers/stream";
import { getContentString } from "../utils";
import type { HumanInterrupt } from "@langchain/langgraph/prebuilt";

interface UseThreadEffectsProps {
  lastError: React.MutableRefObject<string | undefined>;
  setFirstTokenReceived: (value: boolean) => void;
  isRespondingToInterrupt: boolean;
  setIsRespondingToInterrupt: (value: boolean) => void;
  setCurrentInterrupt: (value: HumanInterrupt | null) => void;
}

export function useThreadEffects({
  lastError,
  setFirstTokenReceived,
  isRespondingToInterrupt,
  setIsRespondingToInterrupt,
  setCurrentInterrupt,
}: UseThreadEffectsProps) {
  const stream = useStreamContext();
  const messages = stream.messages;

  useEffect(() => {
    if (!stream.error) {
      lastError.current = undefined;
      return;
    }
    const message =
      (typeof stream.error === "object" && stream.error?.message) ||
      String(stream.error);

    if (!message || lastError.current === message) {
      return;
    }

    lastError.current = message;
    toast.error("An error occurred. Please try again.", {
      description: `Error: ${message}`,
      richColors: true,
      closeButton: true,
    });
  }, [stream.error, lastError]);

  useEffect(() => {
    const lastMessage = messages?.[messages.length - 1];
    if (lastMessage?.type !== "ai") {
      return;
    }

    const contentString = getContentString(lastMessage.content);
    if (contentString.trim().length > 0) {
      setFirstTokenReceived(true);
    }
  }, [messages, setFirstTokenReceived]);

  useEffect(() => {
    if (stream.interrupt && !isRespondingToInterrupt) {
      setCurrentInterrupt(stream.interrupt as HumanInterrupt);
      setIsRespondingToInterrupt(true);
    } else if (!stream.interrupt && isRespondingToInterrupt) {
      setIsRespondingToInterrupt(false);
      setCurrentInterrupt(null);
    }
  }, [
    stream.interrupt,
    isRespondingToInterrupt,
    setCurrentInterrupt,
    setIsRespondingToInterrupt,
  ]);
}
