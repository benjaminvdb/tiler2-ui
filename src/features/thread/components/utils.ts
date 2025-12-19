import type {
  UIMessage,
  ContentBlock,
} from "@/core/providers/stream/stream-types";

/**
 * Extracts a string summary from a message's content, supporting multimodal (text, image, file, etc.).
 * - If text is present, returns the joined text.
 * - If not, returns a label for the first non-text modality (e.g., 'Image', 'Other').
 * - If unknown, returns 'Multimodal message'.
 */
export const getContentString = (content: UIMessage["content"]): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return String(content);

  const texts = (content as ContentBlock[])
    .filter((c): c is { type: "text"; text: string } => c.type === "text")
    .map((c) => c.text);
  return texts.join(" ");
};
