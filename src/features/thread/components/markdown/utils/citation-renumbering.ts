/**
 * Citation renumbering utilities for display.
 *
 * Backend generates globally unique source IDs to prevent race conditions
 * during parallel tool execution. This module handles renumbering those
 * unique IDs to sequential [1], [2], [3]... for clean UX.
 */

import { Source } from "../components/citation-link";

export interface RenumberingResult {
  /** Sources with renumbered sequential IDs */
  renumberedSources: Source[];
  /** Mapping from original unique ID to sequential number */
  idMapping: Map<string, number>; // Changed key from number to string
  /** Message content with citations renumbered */
  renumberedContent: string;
}

/**
 * Renumber sources and citations based on order of appearance in message.
 *
 * Extracts citation IDs from message content in order of appearance,
 * assigns sequential numbers [1], [2], [3]..., and replaces all
 * citation markers in the content.
 *
 * @param messageContent - Message text containing citations like [123456789]
 * @param sources - Array of sources with unique IDs from backend
 * @returns Renumbered sources, ID mapping, and updated content
 */
export function renumberCitations(
  messageContent: string,
  sources: Source[],
): RenumberingResult {
  // Extract citation IDs in order of appearance - matches ref-[a-z0-9]{7} pattern
  const citationPattern = /\[(ref-[a-z0-9]{7})\]/g;
  const citedIdsInOrder: string[] = []; // Changed from number[] to string[]
  const seen = new Set<string>(); // Changed from Set<number> to Set<string>
  let match;

  while ((match = citationPattern.exec(messageContent)) !== null) {
    const id = match[1]; // e.g., "ref-a7b3c9d" - no parseInt needed
    if (!seen.has(id)) {
      citedIdsInOrder.push(id);
      seen.add(id);
    }
  }

  // Create mapping: original unique ID → sequential number (1-indexed)
  const idMapping = new Map<string, number>(); // Changed key from number to string
  citedIdsInOrder.forEach((originalId, index) => {
    idMapping.set(originalId, index + 1);
  });

  // Create renumbered sources (deduplicated by original unique ID)
  // Use Map to ensure each unique source ID appears only once
  const uniqueSourcesMap = new Map<string, Source>();
  sources.forEach((source) => {
    if (idMapping.has(source.id) && !uniqueSourcesMap.has(source.id)) {
      uniqueSourcesMap.set(source.id, source);
    }
  });

  const renumberedSources = Array.from(uniqueSourcesMap.values())
    .map((s) => ({
      ...s,
      id: idMapping.get(s.id)!.toString(), // Convert number to string for id
    }))
    .sort((a, b) => parseInt(a.id) - parseInt(b.id)); // Parse string IDs for sorting

  // Replace citation IDs in message content
  const renumberedContent = messageContent.replace(
    citationPattern,
    (match, id) => {
      const newId = idMapping.get(id); // id is already a string
      return newId !== undefined ? `[${newId}]` : match;
    },
  );

  return {
    renumberedSources,
    idMapping,
    renumberedContent,
  };
}
