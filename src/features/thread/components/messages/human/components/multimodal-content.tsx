import { MultimodalPreview } from "../../../multimodal-preview";
import type { MultimodalContentBlock } from "@/shared/types";
import { MultimodalContentProps } from "../types";

/**
 * Type guard to check if a content block is a multimodal content block
 * with base64 data (image or file)
 */
const isMultimodalContentBlock = (
  block: unknown,
): block is MultimodalContentBlock => {
  if (typeof block !== "object" || block === null) {
    return false;
  }

  const candidate = block as Record<string, unknown>;
  const hasBase64Data = typeof candidate.data === "string";
  const hasType = candidate.type === "image" || candidate.type === "file";
  const hasMimeType = typeof candidate.mimeType === "string";

  return hasBase64Data && hasType && hasMimeType;
};

export const MultimodalContent: React.FC<MultimodalContentProps> = ({
  content,
}) => {
  if (!Array.isArray(content) || content.length === 0) {
    return null;
  }

  // Filter for multimodal blocks (images and files with base64 data)
  // Cast content to unknown[] first to allow proper type narrowing
  const mediaBlocks = (content as unknown[]).filter(isMultimodalContentBlock);

  if (mediaBlocks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-end justify-end gap-2">
      {mediaBlocks.map((block, idx) => {
        // Generate stable key from block content - use data for the key
        const sourceKey = block.data.slice(0, 50);
        const key =
          block.type === "image"
            ? `img-${sourceKey}`
            : `file-${sourceKey}-${idx}`;

        return (
          <MultimodalPreview
            key={key}
            block={block}
            size="md"
          />
        );
      })}
    </div>
  );
};
