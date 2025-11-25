/**
 * Activities feature module.
 *
 * Provides components and hooks for displaying tenant-specific
 * activity data in a data table with server-side operations.
 */

// Components
export { ActivitiesDataTable } from "./components/activities-data-table";
export { DataTableColumnHeader } from "./components/data-table-column-header";
export { DataTablePagination } from "./components/data-table-pagination";
export { DataTableToolbar } from "./components/data-table-toolbar";

// Hooks
export { useActivities } from "./hooks/use-activities";
export { useActivitySchema } from "./hooks/use-activity-schema";
export type { UseActivitySchemaReturn } from "./hooks/use-activity-schema";

// Types
export type {
  ActivitiesListResponse,
  ActivitiesParams,
  ActivityRow,
  ColumnMetadata,
} from "./types";
