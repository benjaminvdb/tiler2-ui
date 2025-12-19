import { useEffect } from "react";
import { toast } from "sonner";
import { useStreamContext } from "@/core/providers/stream";
import { getContentString } from "@/features/thread/components/utils";

interface UseThreadEffectsProps {
  lastErrorRef: React.MutableRefObject<string | undefined>;
  setFirstTokenReceived: (value: boolean) => void;
}

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
      .find((message) => message.role === "assistant");
    if (!lastAiMessage) {
      return;
    }

    const contentString = getContentString(lastAiMessage.parts);
    if (contentString.trim().length > 0) {
      setFirstTokenReceived(true);
    }
  }, [messages, setFirstTokenReceived]);
}
