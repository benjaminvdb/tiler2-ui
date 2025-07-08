import { MarkdownText } from "../../../../markdown-text";

interface MessageTextProps {
  contentString: string;
}
export const MessageText: React.FC<MessageTextProps> = ({ contentString }) => {
  if (contentString.length === 0) {
    return null;
  }
  return (
    <div className="py-1">
      <MarkdownText>{contentString}</MarkdownText>
    </div>
  );
};
