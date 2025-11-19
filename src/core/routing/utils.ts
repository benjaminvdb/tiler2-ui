/**
 * Routing Utilities
 *
 * Helper functions for URL manipulation and navigation.
 */

import { SearchParams } from "./search-params";

/**
 * Merge existing search params with updates
 */
export function mergeSearchParams(
  current: URLSearchParams,
  updates: Partial<SearchParams>,
): URLSearchParams {
  const merged = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null) {
      merged.delete(key);
    } else {
      merged.set(key, String(value));
    }
  }

  return merged;
}
