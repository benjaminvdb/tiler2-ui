import { MarkdownText } from "../../../../markdown-text-lazy";

interface MessageTextProps {
  contentString: string;
}

export function MessageText({ contentString }: MessageTextProps) {
  if (contentString.length === 0) {
    return null;
  }

  return (
    <div className="py-1">
      <MarkdownText>{contentString}</MarkdownText>
    </div>
  );
}
