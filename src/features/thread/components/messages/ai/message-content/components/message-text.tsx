import { MarkdownText } from "../../../../markdown-text";
import { useStreamingText } from "./hooks/use-streaming-text";

interface MessageTextProps {
  contentString: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const MessageText: React.FC<MessageTextProps> = ({
  contentString,
  containerRef,
}) => {
  const displayedText = useStreamingText(contentString);

  if (displayedText.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: "15px",
        letterSpacing: "0.01em",
        lineHeight: "1.7",
      }}
    >
      <MarkdownText>{displayedText}</MarkdownText>
    </div>
  );
};
