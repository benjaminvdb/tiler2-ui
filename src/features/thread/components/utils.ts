import type { UIMessage } from "@/core/providers/stream/stream-types";

/**
 * Extracts a string summary from a message's parts, supporting text and reasoning parts.
 */
export const getContentString = (parts: UIMessage["parts"]): string => {
  if (!Array.isArray(parts)) return "";

  const texts = parts
    .filter(
      (part): part is { type: "text" | "reasoning"; text: string } =>
        part.type === "text" || part.type === "reasoning",
    )
    .map((part) => part.text);
  return texts.join(" ");
};
