import type { FileUIPart } from "ai";
import type { ContentBlocks } from "@/shared/types";

const buildFileUrl = (block: ContentBlocks[number]): string => {
  if (block.url) return block.url;
  if (block.data) {
    return `data:${block.mimeType};base64,${block.data}`;
  }
  return "";
};

const buildFileParts = (contentBlocks: ContentBlocks): FileUIPart[] => {
  const parts: FileUIPart[] = [];

  for (const block of contentBlocks) {
    const url = buildFileUrl(block);
    if (!url) continue;

    const filename = block.metadata?.filename ?? block.metadata?.name;

    parts.push({
      type: "file",
      mediaType: block.mimeType,
      url,
      ...(filename ? { filename } : {}),
    });
  }

  return parts;
};

export const buildMessageFiles = (contentBlocks: ContentBlocks) =>
  buildFileParts(contentBlocks);
