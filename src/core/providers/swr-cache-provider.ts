/**
 * SWR cache provider that persists cache to localStorage.
 * Restores cache on page load and saves before unload.
 */

import type { Cache, State } from "swr";

const CACHE_KEY = "link-chat-swr-cache";

/** Creates a localStorage-backed cache for SWR data persistence. */
export function localStorageProvider(): Cache {
  const map = new Map<string, State<unknown>>(
    JSON.parse(localStorage.getItem(CACHE_KEY) || "[]"),
  );

  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem(CACHE_KEY, appCache);
  });

  return map as Cache;
}
