import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MarkdownText } from "../../../../markdown-text";
import { useStreamingText } from "./hooks/use-streaming-text";
import { useTextSelection } from "@/features/insights/hooks/use-text-selection";
import { useSaveInsight } from "@/features/insights/hooks/use-save-insight";
import { FloatingSaveButton } from "@/features/insights/components/floating-save-button";
import { useSearchParamState } from "@/core/routing/hooks";

/**
 * Utility to compose multiple refs together.
 * Based on @radix-ui/react-compose-refs pattern.
 * Setting ref.current is the standard React pattern for callback refs.
 */
function setRef<T>(ref: React.Ref<T> | undefined, value: T): void {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref != null) {
    // @ts-expect-error - Setting ref.current is standard React pattern (see Radix UI)
    (ref as React.MutableRefObject<T>).current = value;
  }
}

interface MessageTextProps {
  contentString: string;
  containerRef?: React.RefObject<HTMLDivElement | null> | undefined;
  messageId?: string | undefined;
  checkpointId?: string | undefined;
  branch?: string | undefined;
}

export const MessageText: React.FC<MessageTextProps> = ({
  contentString,
  containerRef,
  messageId,
  checkpointId,
  branch,
}) => {
  const displayedText = useStreamingText(contentString);
  const [threadId] = useSearchParamState("threadId");
  const [saved, setSaved] = useState(false);

  const {
    selectedText,
    selectionPosition,
    containerRef: selectionContainerRef,
    handleMouseUp,
    clearSelection,
  } = useTextSelection();
  const { saveInsight, isSaving } = useSaveInsight();

  const handleSave = useCallback(async () => {
    if (!selectedText || !threadId) return;

    const result = await saveInsight({
      thread_id: threadId,
      ...(messageId && { message_id: messageId }),
      ...(checkpointId && { checkpoint_id: checkpointId }),
      ...(branch && { branch }),
      insight_content: selectedText,
    });

    if (result) {
      setSaved(true);
      toast.success("Insight saved successfully");

      setTimeout(() => {
        setSaved(false);
        clearSelection();
      }, 2000);
    } else {
      toast.error("Failed to save insight");
    }
  }, [
    selectedText,
    threadId,
    messageId,
    checkpointId,
    branch,
    saveInsight,
    clearSelection,
  ]);

  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      setRef(containerRef, node);
      setRef(selectionContainerRef, node);
    },
    [containerRef, selectionContainerRef],
  );

  if (displayedText.length === 0) {
    return null;
  }

  return (
    <div
      ref={handleRef}
      onMouseUp={handleMouseUp}
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: "15px",
        letterSpacing: "0.01em",
        lineHeight: "1.7",
        position: "relative",
      }}
    >
      <MarkdownText>{displayedText}</MarkdownText>

      <AnimatePresence>
        {selectionPosition && (
          <FloatingSaveButton
            position={selectionPosition}
            saved={saved}
            onSave={handleSave}
            disabled={isSaving || !threadId}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
