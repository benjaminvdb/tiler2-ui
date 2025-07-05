import { useEffect } from "react";
import { toast } from "sonner";
import { useStreamContext } from "@/providers/stream";

interface UseThreadEffectsProps {
  lastError: React.MutableRefObject<string | undefined>;
  prevMessageLength: React.MutableRefObject<number>;
  setFirstTokenReceived: (value: boolean) => void;
  isRespondingToInterrupt: boolean;
  setIsRespondingToInterrupt: (value: boolean) => void;
  setCurrentInterrupt: (value: any) => void;
}

export function useThreadEffects({
  lastError,
  prevMessageLength,
  setFirstTokenReceived,
  isRespondingToInterrupt,
  setIsRespondingToInterrupt,
  setCurrentInterrupt,
}: UseThreadEffectsProps) {
  const stream = useStreamContext();
  const messages = stream.messages;

  // Error handling effect
  useEffect(() => {
    if (!stream.error) {
      lastError.current = undefined;
      return;
    }
    try {
      const message = (stream.error as any).message;
      if (!message || lastError.current === message) {
        // Message has already been logged. do not modify ref, return early.
        return;
      }

      // Message is defined, and it has not been logged yet. Save it, and send the error
      lastError.current = message;
      toast.error("An error occurred. Please try again.", {
        description: `Error: ${message}`,
        richColors: true,
        closeButton: true,
      });
    } catch {
      // no-op
    }
  }, [stream.error]);

  // First token received effect
  useEffect(() => {
    if (
      messages.length !== prevMessageLength.current &&
      messages?.length &&
      messages[messages.length - 1].type === "ai"
    ) {
      setFirstTokenReceived(true);
    }

    prevMessageLength.current = messages.length;
  }, [messages, setFirstTokenReceived]);

  // Interrupt handling effect
  useEffect(() => {
    if (stream.interrupt && !isRespondingToInterrupt) {
      // There's an active interrupt, set up response mode
      setCurrentInterrupt(stream.interrupt);
      setIsRespondingToInterrupt(true);
    } else if (!stream.interrupt && isRespondingToInterrupt) {
      // Interrupt was resolved, clear response mode
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
