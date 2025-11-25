/**
 * Hook for fetching activities data with SWR.
 *
 * Provides server-side pagination, sorting, and filtering support
 * with automatic authentication via Auth0.
 */

import useSWR from "swr";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { env } from "@/env";
import type {
  ActivitiesListResponse,
  ActivitiesParams,
  ActivityRow,
} from "../types";

/**
 * Base URL for activities API endpoints.
 */
const ACTIVITIES_API_BASE = `${env.API_URL}/api/v1/activities`;

export interface UseActivitiesReturn {
  /** List of activity rows */
  activities: ActivityRow[];
  /** Total count of activities in the table */
  total: number;
  /** Error from the last fetch attempt */
  error: Error | undefined;
  /** Whether the initial fetch is in progress */
  isLoading: boolean;
  /** Whether a revalidation is in progress */
  isValidating: boolean;
  /** Manually revalidate the data */
  mutate: () => void;
}

/**
 * Build a URL with query parameters for activities API.
 *
 * @param params - Query parameters for filtering, sorting, and pagination
 * @returns Full URL with query string
 */
function buildActivitiesUrl(params: ActivitiesParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }
  if (params.sortBy) {
    searchParams.set("sort_by", params.sortBy);
  }
  if (params.sortOrder) {
    searchParams.set("sort_order", params.sortOrder);
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.set("offset", params.offset.toString());
  }

  const queryString = searchParams.toString();
  return queryString
    ? `${ACTIVITIES_API_BASE}?${queryString}`
    : ACTIVITIES_API_BASE;
}

/**
 * Hook for fetching activities with server-side pagination and sorting.
 *
 * @param params - Query parameters for filtering, sorting, and pagination
 * @returns Activities data, loading state, and error information
 *
 * @example
 * const { activities, total, columns, isLoading } = useActivities({
 *   search: "transport",
 *   sortBy: "impact_climate",
 *   sortOrder: "desc",
 *   limit: 50,
 *   offset: 0
 * });
 */
export function useActivities(
  params: ActivitiesParams = {},
): UseActivitiesReturn {
  const fetchWithAuth = useAuthenticatedFetch();

  // Build URL with all parameters for cache key
  const url = buildActivitiesUrl(params);

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ActivitiesListResponse>(
      url,
      async (url: string) => {
        const response = await fetchWithAuth(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch activities");
        }
        return response.json();
      },
      {
        revalidateOnFocus: false,
        dedupingInterval: 5000, // Shorter interval for data tables
        keepPreviousData: true, // Keep showing previous data while loading new page
      },
    );

  return {
    activities: data?.activities ?? [],
    total: data?.total ?? 0,
    error,
    isLoading,
    isValidating,
    mutate: () => void mutate(),
  };
}
