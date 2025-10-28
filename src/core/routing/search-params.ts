/**
 * Type-safe search parameter schemas for URL query parameters.
 * Uses Zod for runtime validation and type inference.
 */

import { z } from "zod";

export const SearchParamsSchema = z.object({
  threadId: z.string().optional(),
  chatHistoryOpen: z.coerce.boolean().optional(),
  hideToolCalls: z.coerce.boolean().optional(),
  workflow: z.string().optional(),
  apiUrl: z.string().optional(),
  assistantId: z.string().optional(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export type SearchParamKey = keyof SearchParams;

export function parseSearchParams(searchParams: URLSearchParams): SearchParams {
  const params: Record<string, string | boolean | undefined> = {};

  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  const result = SearchParamsSchema.safeParse(params);

  if (result.success) {
    return result.data;
  }

  console.warn("Invalid search params:", result.error);
  return {};
}

/**
 * Serialize search params to URL query string, omitting undefined values.
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
