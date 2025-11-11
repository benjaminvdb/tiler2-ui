import type { MultimodalContentBlock } from "@/shared/types";

export interface MultimodalPreviewProps {
  block: MultimodalContentBlock;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export interface PreviewComponentProps {
  block: MultimodalContentBlock;
  removable?: boolean;
  onRemove?: (() => void) | undefined;
  className?: string | undefined;
  size?: "sm" | "md" | "lg";
}

export const isImageBlock = (block: MultimodalContentBlock): boolean => {
  return (
    block.type === "image" &&
    typeof block.mimeType === "string" &&
    block.mimeType.startsWith("image/")
  );
};

export const isPdfBlock = (block: MultimodalContentBlock): boolean => {
  return (
    block.type === "file" &&
    block.mimeType === "application/pdf"
  );
};
