import { v4 as uuidv4 } from "uuid";
import type {
  UIMessage,
  ContentBlock,
} from "@/core/providers/stream/ag-ui-types";
import type { ContentBlocks } from "@/shared/types";

export const buildHumanMessage = (
  input: string,
  contentBlocks: ContentBlocks,
): UIMessage => {
  // Start with text content if provided
  const content: ContentBlock[] = [];

  if (input.trim().length > 0) {
    content.push({ type: "text", text: input });
  }

  // Convert multimodal content blocks to UIMessage format
  for (const block of contentBlocks) {
    if (block.type === "image") {
      // Convert base64 image to image_url format
      const dataUrl = `data:${block.mimeType};base64,${block.data}`;
      content.push({
        type: "image_url",
        image_url: { url: dataUrl },
      });
    } else if (block.type === "file") {
      // Convert file to binary format
      content.push({
        type: "binary",
        mimeType: block.mimeType,
        data: block.data,
      });
    }
  }

  return {
    id: uuidv4(),
    type: "human",
    content:
      content.length === 1 && content[0].type === "text" ? input : content,
  };
};
