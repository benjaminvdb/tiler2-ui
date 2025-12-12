/**
 * Hook for fetching activities schema (column metadata) with SWR.
 *
 * Fetches the schema once and caches it to ensure stable column definitions
 * for TanStack Table. This prevents column rebuilds on every data fetch.
 */

import useSWR from "swr";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { env } from "@/env";
import type { ActivitiesListResponse, ColumnMetadata } from "../types";

/**
 * Base URL for activities API endpoints.
 */
const ACTIVITIES_API_BASE = `${env.API_URL}/activities`;

export interface UseActivitySchemaReturn {
  /** Column metadata for dynamic table rendering */
  columns: ColumnMetadata[];
  /** Error from the last fetch attempt */
  error: Error | undefined;
  /** Whether the initial fetch is in progress */
  isLoading: boolean;
}

/**
 * Hook for fetching activities schema (column metadata).
 *
 * Caches aggressively since schema rarely changes.
 *
 * @returns Column metadata, loading state, and error information
 *
 * @example
 * const { columns, isLoading, error } = useActivitySchema();
 */
export function useActivitySchema(): UseActivitySchemaReturn {
  const fetchWithAuth = useAuthenticatedFetch();

  const schemaUrl = `${ACTIVITIES_API_BASE}?limit=1`;

  const { data, error, isLoading } = useSWR<ActivitiesListResponse>(
    schemaUrl,
    async (url: string) => {
      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch activities schema");
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // Cache for 1 minute
    },
  );

  return {
    columns: data?.columns ?? [],
    error,
    isLoading,
  };
}
