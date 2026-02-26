import type { Source } from "../../messages/ai/source-types";

// Supports [ref-xxx] and [ref-xxx](url), including mixed-case IDs and URLs with parentheses.
const CITATION_PATTERN =
  /\[(ref-[A-Za-z0-9_-]+)\](?:\((?:[^()\\]|\\.|\([^()]*\))*\))?/g;
const SOURCES_SECTION_ANCHOR = "#sources-section";

const escapeMarkdownLinkDestination = (destination: string): string =>
  destination.replace(/[()]/g, "\\$&");

const getCitationTarget = (source: Source | undefined): string => {
  if (source?.type === "web" && source.url) {
    return source.url;
  }
  return SOURCES_SECTION_ANCHOR;
};

export interface RenumberingResult {
  renumberedSources: Source[];
  renumberedContent: string;
}

const extractCitationIdsInOrder = (content: string): string[] => {
  const seen = new Set<string>();
  const ids: string[] = [];
  let match: RegExpExecArray | null;

  CITATION_PATTERN.lastIndex = 0;
  while ((match = CITATION_PATTERN.exec(content)) !== null) {
    const id = match[1];
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    ids.push(id);
  }

  return ids;
};

const dedupeSourcesById = (sources: Source[]): Source[] => {
  const seen = new Set<string>();
  const uniqueSources: Source[] = [];

  for (const source of sources) {
    if (seen.has(source.id)) {
      continue;
    }
    seen.add(source.id);
    uniqueSources.push(source);
  }

  return uniqueSources;
};

const buildSourceLookup = (sources: Source[]): Map<string, Source> => {
  const sourceById = new Map<string, Source>();
  for (const source of sources) {
    sourceById.set(source.id, source);
  }
  return sourceById;
};

const orderSourcesForDisplay = (
  citedIds: string[],
  sourceById: Map<string, Source>,
): Source[] => {
  if (citedIds.length === 0) {
    return [];
  }

  const ordered: Source[] = [];
  const seen = new Set<string>();

  for (const citationId of citedIds) {
    const source = sourceById.get(citationId);
    if (!source || seen.has(source.id)) {
      continue;
    }

    seen.add(source.id);
    ordered.push(source);
  }

  return ordered;
};

const renumberSources = (sources: Source[]): Source[] =>
  sources.map((source, index) => ({
    ...source,
    id: String(index + 1),
  }));

export function renumberCitations(
  content: string,
  sources: Source[],
): RenumberingResult {
  const uniqueSources = dedupeSourcesById(sources);
  const sourceById = buildSourceLookup(uniqueSources);
  const citedIds = extractCitationIdsInOrder(content);
  const orderedSources = orderSourcesForDisplay(citedIds, sourceById);
  const renumberedSources = renumberSources(orderedSources);

  const citationNumberById = new Map<string, number>();
  for (const [index, citationId] of citedIds.entries()) {
    citationNumberById.set(citationId, index + 1);
  }

  CITATION_PATTERN.lastIndex = 0;
  const renumberedContent = content.replace(
    CITATION_PATTERN,
    (fullMatch, id) => {
      const number = citationNumberById.get(id);
      if (!number) {
        return fullMatch;
      }

      const source = sourceById.get(id);
      if (!source) {
        return `[${number}]`;
      }

      const target = getCitationTarget(source);
      return `[${number}](${escapeMarkdownLinkDestination(target)})`;
    },
  );

  return { renumberedSources, renumberedContent };
}
