/**
 * API client for insights operations.
 *
 * Provides methods for creating, listing, and deleting user insights
 * with automatic authentication via Auth0.
 */

import { env } from "@/env";
import type { FetchWithAuth } from "@/core/services/http-client";
import {
  type CreateInsightRequest,
  type CreateInsightResponse,
  type DeleteInsightResponse,
  type InsightListResponse,
  type ListInsightsParams,
} from "../types";

/**
 * Base URL for insights API endpoints.
 * Uses the configured API URL from environment variables.
 */
const INSIGHTS_API_BASE = `${env.API_URL}/insights`;

/**
 * Creates a new insight from a text selection.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param request - Insight creation request with content and metadata
 * @returns Promise resolving to the created insight
 * @throws Error if the API request fails
 *
 * @example
 * const fetch = useAuthenticatedFetch();
 * const insight = await createInsight(fetch, {
 *   thread_id: "thread_123",
 *   insight_content: "Carbon footprint is 5.2 tons CO2e per year",
 *   note: "Important for Q4 report"
 * });
 */
export async function createInsight(
  fetch: FetchWithAuth,
  request: CreateInsightRequest,
): Promise<CreateInsightResponse> {
  const response = await fetch(INSIGHTS_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create insight: ${error}`);
  }

  return response.json();
}

/**
 * Lists user insights with optional search and pagination.
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param params - Query parameters for filtering and pagination
 * @returns Promise resolving to list of insights and total count
 * @throws Error if the API request fails
 *
 * @example
 * const fetch = useAuthenticatedFetch();
 * const { insights, total } = await listInsights(fetch, {
 *   search: "carbon",
 *   limit: 50,
 *   offset: 0
 * });
 */
export async function listInsights(
  fetch: FetchWithAuth,
  params?: ListInsightsParams,
): Promise<InsightListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.search) {
    searchParams.set("search", params.search);
  }
  if (params?.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params?.offset !== undefined) {
    searchParams.set("offset", params.offset.toString());
  }

  const url = `${INSIGHTS_API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list insights: ${error}`);
  }

  return response.json();
}

/**
 * Deletes an insight by ID.
 *
 * Only the owner of the insight can delete it (enforced by backend tenant isolation).
 *
 * @param fetch - Authenticated fetch function from useAuthenticatedFetch hook
 * @param insightId - UUID of the insight to delete
 * @returns Promise resolving to deletion confirmation
 * @throws Error if the API request fails or insight not found
 *
 * @example
 * const fetch = useAuthenticatedFetch();
 * await deleteInsight(fetch, "550e8400-e29b-41d4-a716-446655440000");
 */
export async function deleteInsight(
  fetch: FetchWithAuth,
  insightId: string,
): Promise<DeleteInsightResponse> {
  const response = await fetch(`${INSIGHTS_API_BASE}/${insightId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete insight: ${error}`);
  }

  return response.json();
}
