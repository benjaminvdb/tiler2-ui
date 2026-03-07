/**
 * Side effects for thread error handling and streaming token detection.
 */

import { useEffect } from "react";
import { useStreamContext } from "@/core/providers/stream";
import { getContentString } from "@/features/thread/components/utils";

interface UseThreadEffectsProps {
  setFirstTokenReceived: (value: boolean) => void;
}

/**
 * Tracks when first streaming token arrives.
 */
export function useThreadEffects({
  setFirstTokenReceived,
}: UseThreadEffectsProps) {
  const stream = useStreamContext();
  const messages = stream.messages;

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
