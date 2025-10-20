/**
 * Citation formatting utilities matching backend MLA 9th edition formatting
 */

import { Source } from "../components/citation-link";

/**
 * Format a source for display.
 *
 * - Web sources: "Retrieved from: URL"
 * - Library sources: Display filename directly (filenames are already in MLA format)
 */
export function formatMLA(source: Source): string {
  if (source.type === "web") {
    // Web source: Retrieved from: URL (no quotes)
    return `Retrieved from: ${source.url}`;
  }

  // Library source (knowledge_base, methods_base, csrd_reports):
  // Just return the filename directly - it's already in MLA format
  // Fallback to title if filename not available
  return source.filename || source.title;
}

/**
 * Group sources by type for organized display
 */
export function groupSourcesByType(sources: Source[]): {
  library: Source[];
  web: Source[];
} {
  const library: Source[] = [];
  const web: Source[] = [];

  for (const source of sources) {
    if (source.type === "web") {
      web.push(source);
    } else {
      // knowledge_base, methods_base, csrd_reports go to library
      library.push(source);
    }
  }

  return { library, web };
}
