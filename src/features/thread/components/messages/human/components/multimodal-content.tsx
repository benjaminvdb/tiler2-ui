import { isFileUIPart, type FileUIPart } from "ai";
import { MultimodalPreview } from "../../../multimodal-preview";
import type { MultimodalContentBlock } from "@/shared/types";
import { MultimodalContentProps } from "../types";

const filePartToBlock = (part: FileUIPart): MultimodalContentBlock => {
  const isImage = part.mediaType.startsWith("image/");
  const base: MultimodalContentBlock = isImage
    ? { type: "image", mimeType: part.mediaType }
    : { type: "file", mimeType: part.mediaType };

  if (part.url) {
    base.url = part.url;
  }
  if (part.filename) {
    base.metadata = { filename: part.filename, name: part.filename };
  }

  return base;
};

export const MultimodalContent: React.FC<MultimodalContentProps> = ({
  parts,
}) => {
  if (!Array.isArray(parts) || parts.length === 0) {
    return null;
  }

  const mediaBlocks = parts.filter(isFileUIPart).map(filePartToBlock);

  if (mediaBlocks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-end justify-end gap-2">
      {mediaBlocks.map((block, idx) => {
        const sourceKey = block.url || String(idx);
        const key =
          block.type === "image"
            ? `img-${sourceKey}-${idx}`
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
