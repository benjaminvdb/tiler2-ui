import { v4 as uuidv4 } from "uuid";
import type {
  UIMessage,
  ContentBlock,
} from "@/core/providers/stream/ag-ui-types";
import type { ContentBlocks } from "@/shared/types";

const buildTextBlocks = (input: string): ContentBlock[] =>
  input.trim().length > 0 ? [{ type: "text", text: input }] : [];

const createImageBlock = (
  block: Extract<ContentBlocks[number], { type: "image" }>,
): ContentBlock | null => {
  const data = block.data ?? "";
  const url =
    block.url || (data ? `data:${block.mimeType};base64,${data}` : "");
  if (!url && !data) return null;

  const imageBlock: ContentBlock = { type: "image" };
  if (block.mimeType) {
    imageBlock.mimeType = block.mimeType;
  }
  if (data) {
    imageBlock.data = data;
  }
  if (url) {
    imageBlock.url = url;
  }
  if (block.metadata) {
    imageBlock.metadata = block.metadata;
  }

  return imageBlock;
};

const createFileBlock = (
  block: Extract<ContentBlocks[number], { type: "file" }>,
): ContentBlock | null => {
  const data = block.data ?? "";
  if (!data && !block.url) return null;

  const fileBlock: ContentBlock = { type: "file" };
  if (block.mimeType) {
    fileBlock.mimeType = block.mimeType;
  }
  if (data) {
    fileBlock.data = data;
  }
  if (block.url) {
    fileBlock.url = block.url;
  }
  if (block.metadata) {
    fileBlock.metadata = block.metadata;
  }

  return fileBlock;
};

const buildContentBlocks = (
  input: string,
  contentBlocks: ContentBlocks,
): ContentBlock[] => {
  const content: ContentBlock[] = [...buildTextBlocks(input)];

  for (const block of contentBlocks) {
    if (block.type === "image") {
      const imageBlock = createImageBlock(block);
      if (imageBlock) {
        content.push(imageBlock);
      }
      continue;
    }

    if (block.type === "file") {
      const fileBlock = createFileBlock(block);
      if (fileBlock) {
        content.push(fileBlock);
      }
    }
  }

  return content;
};

export const buildHumanMessage = (
  input: string,
  contentBlocks: ContentBlocks,
): UIMessage => {
  const content = buildContentBlocks(input, contentBlocks);

  return {
    id: uuidv4(),
    type: "human",
    content:
      content.length === 1 && content[0].type === "text" ? input : content,
  };
};
