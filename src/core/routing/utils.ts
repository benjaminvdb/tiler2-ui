/**
 * Routing Utilities
 *
 * Helper functions for URL manipulation and navigation.
 */

import { SearchParams, serializeSearchParams } from "./search-params";

/**
 * Build a URL with search params
 */
export function buildUrl(
  pathname: string,
  params?: Partial<SearchParams>,
): string {
  if (!params || Object.keys(params).length === 0) {
    return pathname;
  }

  const queryString = serializeSearchParams(params);
  return queryString ? `${pathname}?${queryString}` : pathname;
}

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

/**
 * Remove specific keys from search params
 */
export function removeSearchParams(
  current: URLSearchParams,
  keys: string[],
): URLSearchParams {
  const updated = new URLSearchParams(current.toString());

  for (const key of keys) {
    updated.delete(key);
  }

  return updated;
}

/**
 * Replace search params (clears all existing params first)
 * Useful when navigating to completely new sections where previous params should not persist
 */
export function replaceSearchParams(
  updates: Partial<SearchParams>,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  }

  return params;
}
