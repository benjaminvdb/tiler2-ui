/**
 * Type-Safe Search Params State Hook
 *
 * Provides a useState-like interface for managing URL search parameters.
 * Uses native Next.js APIs for optimal performance and compatibility.
 */

"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "@/core/routing/compat/next-navigation";
import type { SearchParamKey, SearchParams } from "../search-params";
import { mergeSearchParams } from "../utils";

/**
 * Hook for managing a single search parameter with type safety
 *
 * @example
 * const [threadId, setThreadId] = useSearchParamState('threadId')
 * setThreadId('new-thread-id')
 * setThreadId(null) // removes the param
 */
export function useSearchParamState<K extends SearchParamKey>(
  key: K,
): [
  Exclude<SearchParams[K], undefined> | null,
  (value: Exclude<SearchParams[K], undefined> | null) => void,
] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const value = searchParams.get(key);

  const buildUrl = useCallback(
    (params: URLSearchParams) => {
      const queryString = params.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    },
    [pathname],
  );

  const setValue = useCallback(
    (newValue: SearchParams[K] | null) => {
      const current = new URLSearchParams(searchParams.toString());

      if (newValue === null || newValue === undefined) {
        current.delete(key);
      } else {
        current.set(key, String(newValue));
      }

      router.replace(buildUrl(current));
    },
    [buildUrl, key, router, searchParams],
  );

  // Parse value based on key type
  let parsedValue: Exclude<SearchParams[K], undefined> | null = null;

  // Handle boolean params
  if (key === "chatHistoryOpen" || key === "hideToolCalls") {
    parsedValue = (
      value === "true" ? true : value === "false" ? false : null
    ) as Exclude<SearchParams[K], undefined> | null;
  } else if (value !== null) {
    // For string params, use the value directly (not undefined)
    parsedValue = value as Exclude<SearchParams[K], undefined>;
  }

  return [parsedValue, setValue];
}

/**
 * Hook for managing multiple search parameters at once
 *
 * @example
 * const updateParams = useSearchParamsUpdate()
 * updateParams({ threadId: 'abc', chatHistoryOpen: true })
 */
export function useSearchParamsUpdate(): (
  updates: Partial<SearchParams>,
) => void {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const baseParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  return useCallback(
    (updates: Partial<SearchParams>) => {
      const merged = mergeSearchParams(baseParams, updates);
      const queryString = merged.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(target);
    },
    [baseParams, pathname, router],
  );
}

/**
 * Hook to get all current search params as a typed object
 */
export function useSearchParamsObject(): Partial<SearchParams> {
  const searchParams = useSearchParams();
  const params: Partial<SearchParams> = {};

  // Convert to typed object
  if (searchParams.has("threadId")) {
    params.threadId = searchParams.get("threadId") || undefined;
  }
  if (searchParams.has("chatHistoryOpen")) {
    params.chatHistoryOpen = searchParams.get("chatHistoryOpen") === "true";
  }
  if (searchParams.has("hideToolCalls")) {
    params.hideToolCalls = searchParams.get("hideToolCalls") === "true";
  }
  if (searchParams.has("workflow")) {
    params.workflow = searchParams.get("workflow") || undefined;
  }

  return params;
}
