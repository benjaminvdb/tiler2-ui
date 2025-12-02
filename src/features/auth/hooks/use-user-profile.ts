/**
 * Hook for fetching the current user's profile from the backend.
 */

import useSWR from "swr";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { env } from "@/env";
import type { UserProfile } from "../types";

const USER_API_BASE = `${env.API_URL}/api/v1/user`;

export interface UseUserProfileReturn {
  profile: UserProfile | null;
  error: Error | undefined;
  isLoading: boolean;
}

/**
 * Fetches the current user's profile (first_name, email) from the backend.
 * Uses SWR for caching and automatic revalidation.
 */
export function useUserProfile(): UseUserProfileReturn {
  const fetchWithAuth = useAuthenticatedFetch();

  const { data, error, isLoading } = useSWR<UserProfile>(
    `${USER_API_BASE}/me`,
    async (url: string) => {
      const response = await fetchWithAuth(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch user profile");
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Cache for 1 minute
    },
  );

  return {
    profile: data ?? null,
    error,
    isLoading,
  };
}
