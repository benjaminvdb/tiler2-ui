import { MarkdownText } from "../../../../markdown-text";
import { useStreamingText } from "./hooks/use-streaming-text";

interface MessageTextProps {
  contentString: string;
}

export const MessageText: React.FC<MessageTextProps> = ({ contentString }) => {
  const displayedText = useStreamingText(contentString);

  if (displayedText.length === 0) {
    return null;
  }

  return (
    <div className="py-1">
      <MarkdownText>{displayedText}</MarkdownText>
    </div>
  );
};
