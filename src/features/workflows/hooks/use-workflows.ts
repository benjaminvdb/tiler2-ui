/**
 * Hook for fetching available workflows from the API.
 */

import useSWR from "swr";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { getClientConfig } from "@/core/config/client";
import type { WorkflowConfig } from "../types";

/** Fetches and caches workflow configurations from the API. */
export function useWorkflows() {
  const fetchWithAuth = useAuthenticatedFetch();
  const { apiUrl } = getClientConfig();

  const { data, error, isLoading, isValidating } = useSWR<WorkflowConfig[]>(
    apiUrl ? `${apiUrl}/workflows` : null,
    async (url: string) => {
      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch workflows");
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  return {
    workflows: data ?? [],
    error,
    isLoading,
    isValidating,
  };
}
