import React, { useCallback } from "react";
import type { MultimodalContentBlock } from "@/shared/types";
import { MultimodalPreview } from "./multimodal-preview";
import { cn } from "@/shared/utils/utils";

interface ContentBlocksPreviewProps {
  blocks: MultimodalContentBlock[];
  onRemove: (idx: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface BlockItemProps {
  block: MultimodalContentBlock;
  index: number;
  size: "sm" | "md" | "lg";
  onRemove: (idx: number) => void;
}

const BlockItem = React.memo(function BlockItem({
  block,
  index,
  size,
  onRemove,
}: BlockItemProps) {
  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  // Generate stable key from block content
  const blockKey = block.type === "text"
    ? `text-${block.text?.slice(0, 50)}-${index}`
    : block.type === "image"
    ? `image-${block.source?.url || block.source?.data?.slice(0, 50)}-${index}`
    : `block-${index}`;

  return (
    <MultimodalPreview
      key={blockKey}
      block={block}
      removable
      onRemove={handleRemove}
      size={size}
    />
  );
});

/**
 * Renders a preview of content blocks with optional remove functionality.
 * Uses cn utility for robust class merging.
 */
export const ContentBlocksPreview: React.FC<ContentBlocksPreviewProps> = ({
  blocks,
  onRemove,
  size = "md",
  className,
}) => {
  if (!blocks.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-2 p-3.5 pb-0", className)}>
      {blocks.map((block, idx) => (
        <BlockItem
          key={idx}
          block={block}
          index={idx}
          size={size}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
