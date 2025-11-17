import { MultimodalPreview } from "../../../multimodal-preview";
import { isBase64ContentBlock } from "@/features/file-upload/services/multimodal-utils";
import { MultimodalContentProps } from "../types";

export const MultimodalContent: React.FC<MultimodalContentProps> = ({
  content,
}) => {
  if (!Array.isArray(content) || content.length === 0) {
    return null;
  }

  const mediaBlocks = content.filter(isBase64ContentBlock);

  if (mediaBlocks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-end justify-end gap-2">
      {mediaBlocks.map((block, idx) => {
        // Generate stable key from block content - use source for image/file types
        const source = block.source;
        const sourceKey =
          source && typeof source === "object" && "url" in source
            ? source.url || ("data" in source && typeof source.data === "string" ? source.data.slice(0, 50) : null) || idx
            : idx;
        const key = block.type === "image" ? `img-${sourceKey}` : `file-${sourceKey}`;

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
