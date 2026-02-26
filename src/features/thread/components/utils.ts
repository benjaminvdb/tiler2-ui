import type { UIMessage } from "@/core/providers/stream/stream-types";

/**
 * Extracts a string summary from a message's parts, supporting text and reasoning parts.
 */
export const getContentString = (parts: UIMessage["parts"]): string => {
  if (!Array.isArray(parts)) return "";

  const texts: string[] = [];
  for (const part of parts) {
    if (!part || typeof part !== "object") {
      continue;
    }
    if (
      (part.type === "text" || part.type === "reasoning") &&
      typeof part.text === "string"
    ) {
      texts.push(part.text);
    }
  }
  return texts.join(" ");
};
