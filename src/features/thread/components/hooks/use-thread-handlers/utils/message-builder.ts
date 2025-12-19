import { v4 as uuidv4 } from "uuid";
import type { UserMessage } from "@copilotkit/shared";
import type { InputContent } from "@ag-ui/core";
import type { ContentBlocks } from "@/shared/types";

// Extended InputContent type to include image_url for multimodal support
type ExtendedInputContent =
  | InputContent
  | { type: "image_url"; image_url: { url: string } };

/**
 * Build a user message in AG-UI format.
 * AG-UI uses role: "user" (not type: "human")
 */
export const buildHumanMessage = (
  input: string,
  contentBlocks: ContentBlocks,
): UserMessage => {
  // Start with text content if provided
  const content: ExtendedInputContent[] = [];

  if (input.trim().length > 0) {
    content.push({ type: "text", text: input });
  }

  // Convert multimodal content blocks to AG-UI InputContent format
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
    role: "user",
    content:
      content.length === 1 && content[0].type === "text"
        ? input
        : (content as InputContent[]),
  };
};
