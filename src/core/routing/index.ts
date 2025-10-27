/**
 * Core Routing Module
 *
 * Centralized routing system with type-safe navigation and search params.
 */

export { ROUTES, type Route } from "./routes";
export {
  SearchParamsSchema,
  parseSearchParams,
  serializeSearchParams,
  type SearchParams,
  type SearchParamKey,
} from "./search-params";
export { buildUrl, mergeSearchParams, removeSearchParams } from "./utils";
