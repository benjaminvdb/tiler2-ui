import { MultimodalPreview } from "@/components/thread/MultimodalPreview";
import { isBase64ContentBlock } from "@/lib/multimodal-utils";
import { MultimodalContentProps } from "../types";

export function MultimodalContent({ content }: MultimodalContentProps) {
  if (!Array.isArray(content) || content.length === 0) {
    return null;
  }

  const mediaBlocks = content.reduce<React.ReactNode[]>((acc, block, idx) => {
    if (isBase64ContentBlock(block)) {
      acc.push(
        <MultimodalPreview
          key={idx}
          block={block}
          size="md"
        />,
      );
    }
    return acc;
  }, []);

  if (mediaBlocks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-end justify-end gap-2">
      {mediaBlocks}
    </div>
  );
}