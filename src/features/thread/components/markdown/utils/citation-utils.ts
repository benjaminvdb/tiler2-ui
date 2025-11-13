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
    return `Retrieved from: ${source.url}`;
  }

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
      library.push(source);
    }
  }

  return { library, web };
}
