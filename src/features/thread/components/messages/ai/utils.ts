import type { UIMessage } from "@/core/providers/stream/stream-types";
import type { Source } from "./source-types";

type SourceLikeRecord = {
  id?: unknown;
  sourceId?: unknown;
  source_id?: unknown;
  type?: unknown;
  sourceType?: unknown;
  source_type?: unknown;
  title?: unknown;
  url?: unknown;
  filename?: unknown;
  pageNumber?: unknown;
  page_number?: unknown;
};

const KNOWN_SOURCE_TYPES = new Set<Source["type"]>([
  "web",
  "knowledge_base",
  "methods_base",
  "csrd_reports",
]);

const asNonEmptyString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const asPositiveInteger = (value: unknown): number | undefined => {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return undefined;
  }
  return value;
};

const resolveSourceId = (value: SourceLikeRecord): string | null =>
  asNonEmptyString(value.sourceId ?? value.source_id ?? value.id) ?? null;

const resolveSourceTypeFromExplicitValue = (
  value: SourceLikeRecord,
): Source["type"] | undefined => {
  if (value.type === "source-url" || value.sourceType === "url") {
    return "web";
  }

  if (value.type === "source-document" || value.sourceType === "document") {
    return "knowledge_base";
  }

  const directType = value.type ?? value.sourceType ?? value.source_type;
  if (KNOWN_SOURCE_TYPES.has(directType as Source["type"])) {
    return directType as Source["type"];
  }

  return undefined;
};

const resolveSourceTypeFromFields = (
  value: SourceLikeRecord,
): Source["type"] | undefined => {
  if (asNonEmptyString(value.url)) {
    return "web";
  }

  if (asNonEmptyString(value.filename)) {
    return "knowledge_base";
  }

  return undefined;
};

const resolveSourceType = (
  value: SourceLikeRecord,
): Source["type"] | undefined =>
  resolveSourceTypeFromExplicitValue(value) ??
  resolveSourceTypeFromFields(value);

const buildSource = (
  sourceLike: SourceLikeRecord,
  id: string,
  type: Source["type"],
): Source => {
  const url = asNonEmptyString(sourceLike.url);
  const filename = asNonEmptyString(sourceLike.filename);
  const title = asNonEmptyString(sourceLike.title);
  const pageNumber = asPositiveInteger(
    sourceLike.page_number ?? sourceLike.pageNumber,
  );

  const source: Source = {
    id,
    type,
    title: title || filename || url || id,
  };

  if (url) {
    source.url = url;
  }

  if (filename) {
    source.filename = filename;
  }

  if (pageNumber) {
    source.page_number = pageNumber;
  }

  return source;
};

const toSource = (value: unknown): Source | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const sourceLike = value as SourceLikeRecord;
  const id = resolveSourceId(sourceLike);
  const type = resolveSourceType(sourceLike);
  if (!id || !type) {
    return null;
  }

  return buildSource(sourceLike, id, type);
};

const mergeSourcesById = (sources: Source[]): Source[] => {
  const mergedById = new Map<string, Source>();

  for (const source of sources) {
    const existing = mergedById.get(source.id);
    if (!existing) {
      mergedById.set(source.id, source);
      continue;
    }

    mergedById.set(source.id, {
      ...existing,
      title: existing.title === existing.id ? source.title : existing.title,
      ...(existing.url ? {} : source.url ? { url: source.url } : {}),
      ...(existing.filename
        ? {}
        : source.filename
          ? { filename: source.filename }
          : {}),
      ...(existing.page_number
        ? {}
        : source.page_number
          ? { page_number: source.page_number }
          : {}),
    });
  }

  return [...mergedById.values()];
};

const isRenderableSource = (source: Source): boolean => {
  if (source.type === "web") {
    return Boolean(source.url);
  }

  return Boolean(source.filename || source.title !== source.id);
};

const extractSourcesFromMetadata = (
  metadata: UIMessage["metadata"],
): Source[] => {
  if (!metadata || typeof metadata !== "object") {
    return [];
  }

  const metadataRecord = metadata as {
    sources?: unknown;
    source?: unknown;
  };

  const values = Array.isArray(metadataRecord.sources)
    ? metadataRecord.sources
    : metadataRecord.source
      ? [metadataRecord.source]
      : [];

  return values
    .map((value) => toSource(value))
    .filter((source): source is Source => source !== null);
};

export const extractSourcesFromParts = (
  parts: UIMessage["parts"],
): Source[] => {
  if (!Array.isArray(parts)) {
    return [];
  }

  return parts
    .map((part) => toSource(part))
    .filter((source): source is Source => source !== null);
};

export const extractSourcesFromMessage = (message: UIMessage): Source[] => {
  const mergedSources = mergeSourcesById([
    ...extractSourcesFromParts(message.parts),
    ...extractSourcesFromMetadata(message.metadata),
  ]);
  return mergedSources.filter(isRenderableSource);
};
