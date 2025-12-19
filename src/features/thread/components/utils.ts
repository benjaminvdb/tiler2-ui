import type { Message } from "@copilotkit/shared";
import type { InputContent } from "@ag-ui/core";

/**
 * Extracts a string summary from a message's content, supporting multimodal (text, image, file, etc.).
 * - If text is present, returns the joined text.
 * - If not, returns a label for the first non-text modality (e.g., 'Image', 'Other').
 * - If unknown, returns 'Multimodal message'.
 */
export const getContentString = (content: Message["content"]): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content);

  const texts = (content as InputContent[])
    .filter((c): c is { type: "text"; text: string } => c.type === "text")
    .map((c) => c.text);
  return texts.join(" ");
};
