import React from "react";
import type { MultimodalContentBlock } from "@/shared/types";
import { MultimodalPreview } from "./multimodal-preview";
import { cn } from "@/shared/utils/utils";

interface ContentBlocksPreviewProps {
  blocks: MultimodalContentBlock[];
  onRemove: (idx: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}
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
        <MultimodalPreview
          key={idx}
          block={block}
          removable
          onRemove={() => onRemove(idx)}
          size={size}
        />
      ))}
    </div>
  );
};
