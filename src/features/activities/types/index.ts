/**
 * Types for the activities feature.
 */

/**
 * Metadata about a column in the activities table.
 */
export interface ColumnMetadata {
  name: string;
  type: "string" | "number" | "integer";
  description: string | null;
}

/**
 * A single activity row from the tenant's activities table.
 * The structure is dynamic based on the tenant's table schema.
 */
export type ActivityRow = Record<string, unknown>;

/**
 * Response from the activities list endpoint.
 */
export interface ActivitiesListResponse {
  activities: ActivityRow[];
  total: number;
  columns: ColumnMetadata[];
}

/**
 * Parameters for fetching activities.
 */
export interface ActivitiesParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
