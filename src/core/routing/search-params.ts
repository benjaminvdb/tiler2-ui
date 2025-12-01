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
  goalId: z.string().optional(),
  taskId: z.string().optional(),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;

export type SearchParamKey = keyof SearchParams;
