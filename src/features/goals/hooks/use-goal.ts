/**
 * Hook for fetching a single goal with SWR.
 *
 * Provides automatic caching and revalidation for goal details.
 */

import useSWR from "swr";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { env } from "@/env";
import type { Goal } from "../types";

/**
 * Base URL for goals API endpoints.
 */
const GOALS_API_BASE = `${env.API_URL}/goals`;

export interface UseGoalReturn {
  /** Goal with milestones and tasks */
  goal: Goal | undefined;
  /** Error from the last fetch attempt */
  error: Error | undefined;
  /** Whether the initial fetch is in progress */
  isLoading: boolean;
  /** Whether a revalidation is in progress */
  isValidating: boolean;
  /** Manually revalidate the data. Supports SWR mutate options for explicit revalidation. */
  mutate: (
    data?: Goal,
    opts?: { revalidate?: boolean },
  ) => Promise<Goal | undefined>;
}

/**
 * Hook for fetching a single goal with full details.
 *
 * @param goalId - UUID of the goal to fetch
 * @returns Goal data, loading state, and error information
 *
 * @example
 * const { goal, isLoading, error } = useGoal("550e8400-e29b-41d4-a716-446655440000");
 */
export function useGoal(goalId: string | undefined): UseGoalReturn {
  const fetchWithAuth = useAuthenticatedFetch();

  const url = goalId ? `${GOALS_API_BASE}/${goalId}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<Goal>(
    url,
    async (url: string) => {
      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch goal");
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      refreshInterval: (data) => {
        const isGenerating =
          data?.status === "generating" || data?.status === "planning";
        return isGenerating ? 3000 : 0;
      },
    },
  );

  return {
    goal: data,
    error,
    isLoading,
    isValidating,
    mutate: (data?: Goal, opts?: { revalidate?: boolean }) =>
      mutate(data, opts),
  };
}
