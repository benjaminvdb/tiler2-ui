import type { UIMessage } from "@/core/providers/stream/stream-types";
import type { Source } from "@/features/thread/components/markdown/components/citation-link";

export const extractSourcesFromParts = (
  parts: UIMessage["parts"],
): Source[] => {
  if (!Array.isArray(parts)) return [];

  const sources: Source[] = [];

  for (const part of parts) {
    if (part.type === "source-url") {
      sources.push({
        id: part.sourceId,
        type: "web",
        title: part.title || part.url || part.sourceId,
        url: part.url,
      });
    }

    if (part.type === "source-document") {
      const filename = part.filename;
      sources.push({
        id: part.sourceId,
        type: "knowledge_base",
        title: part.title || filename || part.sourceId,
        ...(filename ? { filename } : {}),
      });
    }
  }

  return sources;
};
