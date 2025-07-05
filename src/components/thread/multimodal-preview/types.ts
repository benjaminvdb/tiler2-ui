import type { Base64ContentBlock } from "@langchain/core/messages";

export interface MultimodalPreviewProps {
  block: Base64ContentBlock;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export interface PreviewComponentProps {
  block: Base64ContentBlock;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function isImageBlock(block: Base64ContentBlock): boolean {
  return (
    block.type === "image" &&
    block.source_type === "base64" &&
    typeof block.mime_type === "string" &&
    block.mime_type.startsWith("image/")
  );
}

export function isPdfBlock(block: Base64ContentBlock): boolean {
  return (
    block.type === "file" &&
    block.source_type === "base64" &&
    block.mime_type === "application/pdf"
  );
}
