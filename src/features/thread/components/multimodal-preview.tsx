import React from "react";
import {
  MultimodalPreviewProps,
  isImageBlock,
  isPdfBlock,
} from "./multimodal-preview/types";
import { ImagePreview } from "./multimodal-preview/components/image-preview";
import { PdfPreview } from "./multimodal-preview/components/pdf-preview";
import { FallbackPreview } from "./multimodal-preview/components/fallback-preview";

export const MultimodalPreview: React.FC<MultimodalPreviewProps> = ({
  block,
  removable = false,
  onRemove,
  className,
  size = "md",
}) => {
  if (isImageBlock(block)) {
    return (
      <ImagePreview
        block={block}
        removable={removable}
        onRemove={onRemove}
        className={className}
        size={size}
      />
    );
  }
  if (isPdfBlock(block)) {
    return (
      <PdfPreview
        block={block}
        removable={removable}
        onRemove={onRemove}
        className={className}
        size={size}
      />
    );
  }
  return (
    <FallbackPreview
      block={block}
      removable={removable}
      onRemove={onRemove}
      className={className}
      size={size}
    />
  );
};
