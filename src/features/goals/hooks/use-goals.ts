/**
 * Hook for fetching goals list with automatic polling during plan generation.
 */

import useSWR from "swr";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { env } from "@/env";
import type { GoalListResponse, GoalListItem } from "../types";

const GOALS_API_BASE = `${env.API_URL}/goals`;

export interface UseGoalsReturn {
  goals: GoalListItem[];
  total: number;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => void;
}

/**
 * Fetches goals list with progress statistics.
 * Automatically polls every 3s while any goal has status "generating".
 */
export function useGoals(): UseGoalsReturn {
  const fetchWithAuth = useAuthenticatedFetch();

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<GoalListResponse>(
      GOALS_API_BASE,
      async (url: string) => {
        const response = await fetchWithAuth(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to fetch goals");
        }
        return response.json();
      },
      {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        refreshInterval: (data) => {
          const hasGeneratingGoals = data?.goals.some(
            (g) => g.status === "generating" || g.status === "planning",
          );
          return hasGeneratingGoals ? 3000 : 0;
        },
      },
    );

  return {
    goals: data?.goals ?? [],
    total: data?.total ?? 0,
    error,
    isLoading,
    isValidating,
    mutate: () => void mutate(),
  };
}
