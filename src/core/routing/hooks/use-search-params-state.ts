/**
 * Type-Safe Search Params State Hook
 *
 * Provides a useState-like interface for managing URL search parameters.
 * Uses React Router v7 native APIs for optimal performance and compatibility.
 */

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key);

  const setValue = useCallback(
    (newValue: SearchParams[K] | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          if (newValue === null || newValue === undefined) {
            next.delete(key);
          } else {
            next.set(key, String(newValue));
          }

          return next;
        },
        { replace: true },
      );
    },
    [key, setSearchParams],
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
  const [searchParams, setSearchParams] = useSearchParams();

  const baseParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  return useCallback(
    (updates: Partial<SearchParams>) => {
      setSearchParams(
        () => {
          const merged = mergeSearchParams(baseParams, updates);
          return merged;
        },
        { replace: true },
      );
    },
    [baseParams, setSearchParams],
  );
}

/**
 * Hook to get all current search params as a typed object
 */
export function useSearchParamsObject(): Partial<SearchParams> {
  const [searchParams] = useSearchParams();
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
