/**
 * Hook for fetching task context with SWR.
 */

import useSWR from "swr";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { env } from "@/env";
import type { TaskContextResponse } from "../types";

const GOALS_API_BASE = `${env.API_URL}/goals`;

export interface UseTaskContextReturn {
  taskContext: TaskContextResponse | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
}

/**
 * Hook for fetching task context.
 *
 * @param taskId - UUID of the task to fetch context for
 * @returns Task context data, loading state, and error information
 */
export function useTaskContext(taskId: string | null): UseTaskContextReturn {
  const fetchWithAuth = useAuthenticatedFetch();

  const url = taskId ? `${GOALS_API_BASE}/tasks/${taskId}/context` : null;

  const { data, error, isLoading, isValidating } = useSWR<TaskContextResponse>(
    url,
    async (url: string) => {
      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch task context");
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    },
  );

  return {
    taskContext: data,
    error,
    isLoading,
    isValidating,
  };
}
