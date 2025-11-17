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
        // Generate stable key from block content
        const key = block.type === "image_url" && block.image_url?.url
          ? `img-${block.image_url.url.slice(0, 50)}`
          : block.type === "text"
          ? `text-${block.text?.slice(0, 50)}`
          : `block-${idx}`;

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
