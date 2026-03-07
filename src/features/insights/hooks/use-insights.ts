/**
 * Hook for fetching insights list with SWR.
 */

import useSWR from "swr";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { env } from "@/env";
import type { Insight, InsightListResponse } from "../types";

const INSIGHTS_API_BASE = `${env.API_URL}/insights`;

export interface UseInsightsReturn {
  insights: Insight[];
  total: number;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

export function useInsights(): UseInsightsReturn {
  const fetchWithAuth = useAuthenticatedFetch();

  const { data, error, isLoading, mutate } = useSWR<InsightListResponse>(
    INSIGHTS_API_BASE,
    async (url: string) => {
      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch insights");
      }
      return response.json();
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    },
  );

  return {
    insights: data?.insights ?? [],
    total: data?.total ?? 0,
    error,
    isLoading,
    mutate: () => void mutate(),
  };
}
