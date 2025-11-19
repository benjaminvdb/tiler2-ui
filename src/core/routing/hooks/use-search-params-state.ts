/**
 * Type-Safe Search Params State Hook
 *
 * Provides a useState-like interface for managing URL search parameters.
 * Uses React Router v7 native APIs for optimal performance and compatibility.
 */

import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import type { SearchParamKey, SearchParams } from "../search-params";
import { mergeSearchParams } from "../utils";

const BOOLEAN_PARAMS = new Set<SearchParamKey>([
  "chatHistoryOpen",
  "hideToolCalls",
]);

const parseBooleanParam = (value: string | null): boolean | null => {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
};

const parseSearchParamValue = <K extends SearchParamKey>(
  key: K,
  rawValue: string | null,
): Exclude<SearchParams[K], undefined> | null => {
  if (BOOLEAN_PARAMS.has(key)) {
    return parseBooleanParam(rawValue) as Exclude<
      SearchParams[K],
      undefined
    > | null;
  }

  return rawValue as Exclude<SearchParams[K], undefined> | null;
};

/**
 * Hook for managing a single search parameter with type safety
 *
 * @example
 * const [threadId, setThreadId] = useSearchParamState('threadId')
 * setThreadId('new-thread-id')
 * setThreadId(null); // removes the param
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

  return [parseSearchParamValue(key, value), setValue];
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

  return useCallback(
    (updates: Partial<SearchParams>) => {
      setSearchParams(
        () => {
          const baseParams = new URLSearchParams(searchParams.toString());
          const merged = mergeSearchParams(baseParams, updates);
          return merged;
        },
        { replace: true },
      );
    },
    [searchParams, setSearchParams],
  );
}
