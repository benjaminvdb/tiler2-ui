/**
 * Search Parameter Schemas and Types
 *
 * Centralized, type-safe definitions for all URL query parameters.
 * Uses Zod for runtime validation and type inference.
 */

import { z } from "zod";

/**
 * Schema for all application search parameters
 */
export const SearchParamsSchema = z.object({
  // Thread management
  threadId: z.string().optional(),

  // UI state
  chatHistoryOpen: z.coerce.boolean().optional(),
  hideToolCalls: z.coerce.boolean().optional(),

  // Workflow auto-start
  workflow: z.string().optional(),

  // Development configuration (optional overrides)
  apiUrl: z.string().optional(),
  assistantId: z.string().optional(),
});

/**
 * Inferred TypeScript type from schema
 */
export type SearchParams = z.infer<typeof SearchParamsSchema>;

/**
 * Individual param keys for type-safe access
 */
export type SearchParamKey = keyof SearchParams;

/**
 * Parse and validate search params from URLSearchParams
 */
export function parseSearchParams(searchParams: URLSearchParams): SearchParams {
  const params: Record<string, string | boolean | undefined> = {};

  // Convert URLSearchParams to object
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  // Parse with Zod (returns validated object with defaults)
  const result = SearchParamsSchema.safeParse(params);

  if (result.success) {
    return result.data;
  }

  // If validation fails, return empty object
  console.warn("Invalid search params:", result.error);
  return {};
}

/**
 * Serialize search params to URLSearchParams
 * Omits undefined values and handles boolean serialization
 */
export function serializeSearchParams(params: Partial<SearchParams>): string {
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      urlParams.set(key, String(value));
    }
  }

  return urlParams.toString();
}
