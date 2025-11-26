/**
 * Hook for managing activities table state and data fetching.
 *
 * Handles server-side pagination, sorting, filtering, and column configuration.
 */

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import {
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowData,
} from "@tanstack/react-table";

import { useActivities } from "./use-activities";
import { useActivitySchema } from "./use-activity-schema";
import { DataTableColumnHeader } from "../components/data-table-column-header";
import { RiskBadge } from "../components/risk-badge";
import { formatColumnTitle } from "../utils";
import type { ActivityRow, ColumnMetadata } from "../types";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    isSticky?: boolean;
  }
}

// Constants
const STICKY_COLUMN_NAME = "activity_name";
const RISK_COLUMN_WIDTH = 130;

const columnHelper = createColumnHelper<ActivityRow>();

/**
 * Impact column unit labels.
 */
const IMPACT_UNITS: Record<string, string> = {
  impact_soil_pollution: "kg SO₂-eq",
  impact_climate_change: "kg CO₂-eq",
  impact_water_pollution: "kg P-eq",
  impact_land_use: "m²",
  impact_water_use: "m³",
};

/**
 * Format a cell value for display.
 */
function formatCellValue(value: unknown, columnType: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (columnType === "number") {
    const num = Number(value);
    if (!isNaN(num)) {
      return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
  }

  if (columnType === "integer") {
    const num = Number(value);
    if (!isNaN(num)) {
      return num.toLocaleString();
    }
  }

  return String(value);
}

// Column type checks
const isRiskColumn = (name: string): boolean =>
  name.toLowerCase().startsWith("risk_");
const isImpactColumn = (name: string): boolean =>
  name.toLowerCase().startsWith("impact_");
const isLciaColumn = (name: string): boolean =>
  name.toLowerCase().startsWith("lcia_");

/**
 * Build a single column definition from column metadata.
 */
function buildSingleColumn(col: ColumnMetadata): ColumnDef<ActivityRow> {
  const unit = IMPACT_UNITS[col.name];
  const isSticky = col.name === STICKY_COLUMN_NAME;
  const isRisk = isRiskColumn(col.name);

  // Strip group prefixes from column titles
  let columnTitle = col.name;
  if (isLciaColumn(col.name)) {
    columnTitle = columnTitle.replace(/^lcia_/, "");
  } else if (isImpactColumn(col.name)) {
    columnTitle = columnTitle.replace(/^impact_/, "");
  } else if (isRisk) {
    columnTitle = columnTitle.replace(/^risk_/, "");
  }
  columnTitle = formatColumnTitle(columnTitle);

  return {
    id: col.name,
    accessorKey: col.name,
    ...(isRisk && {
      size: RISK_COLUMN_WIDTH,
      minSize: RISK_COLUMN_WIDTH,
      maxSize: RISK_COLUMN_WIDTH,
    }),
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title={columnTitle}
        {...(unit && { unit })}
        isSticky={isSticky}
        allowWrap={isRisk}
      />
    ),
    cell: ({ getValue }) => {
      const value = getValue();
      if (isRisk) {
        return <RiskBadge value={value} />;
      }
      return formatCellValue(value, col.type);
    },
    enableSorting: true,
    enableHiding: true,
    meta: { isSticky },
  };
}

/**
 * Build column definitions from column metadata with grouped headers.
 *
 * Columns are organized into:
 * - Standalone columns (activity_name first, then others)
 * - "ENVIRONMENTAL IMPACTS" group (impact_* columns)
 * - "RISKS" group (risk_* columns)
 * - "LCIA FACTORS" group (lcia_* columns)
 */
function buildColumns(
  columnMetadata: ColumnMetadata[],
): ColumnDef<ActivityRow>[] {
  // Filter out internal ID columns
  const visibleMetadata = columnMetadata.filter(
    (c) => c.name !== "id" && c.name !== "row_id",
  );

  const lciaCols = visibleMetadata.filter((c) => isLciaColumn(c.name));
  const impactCols = visibleMetadata.filter((c) => isImpactColumn(c.name));
  const riskCols = visibleMetadata.filter((c) => isRiskColumn(c.name));
  const otherCols = visibleMetadata.filter(
    (c) =>
      !isLciaColumn(c.name) && !isImpactColumn(c.name) && !isRiskColumn(c.name),
  );

  // Sort otherCols to put activity_name first
  const sortedOtherCols = [...otherCols].sort((a, b) => {
    if (a.name === STICKY_COLUMN_NAME) return -1;
    if (b.name === STICKY_COLUMN_NAME) return 1;
    return 0;
  });

  const columns: ColumnDef<ActivityRow>[] = [];

  // Add standalone columns first
  sortedOtherCols.forEach((col) => {
    columns.push(buildSingleColumn(col));
  });

  // Add ENVIRONMENTAL IMPACTS group
  if (impactCols.length > 0) {
    columns.push(
      columnHelper.group({
        id: "impacts",
        header: () => (
          <span className="block text-center font-semibold">
            ENVIRONMENTAL IMPACTS
          </span>
        ),
        columns: impactCols.map((col) => buildSingleColumn(col)),
      }),
    );
  }

  // Add RISKS group
  if (riskCols.length > 0) {
    columns.push(
      columnHelper.group({
        id: "risks",
        header: () => (
          <span className="block text-center font-semibold">RISKS</span>
        ),
        columns: riskCols.map((col) => buildSingleColumn(col)),
      }),
    );
  }

  // Add LCIA FACTORS group
  if (lciaCols.length > 0) {
    columns.push(
      columnHelper.group({
        id: "lcia",
        header: () => (
          <span className="block text-center font-semibold">LCIA FACTORS</span>
        ),
        columns: lciaCols.map((col) => buildSingleColumn(col)),
      }),
    );
  }

  return columns;
}

export interface UseActivitiesTableReturn {
  table: ReturnType<typeof useReactTable<ActivityRow>>;
  tableColumns: ColumnDef<ActivityRow>[];
  activities: ActivityRow[];
  total: number;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | undefined;
  globalFilter: string;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  handlePageChange: (pageIndex: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleSearchChange: (value: string) => void;
}

/**
 * Hook for managing activities table state and data fetching.
 */
export const useActivitiesTable = (): UseActivitiesTableReturn => {
  // Table state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Fetch schema ONCE (stable column definitions)
  const {
    columns: columnMetadata,
    isLoading: schemaLoading,
    error: schemaError,
  } = useActivitySchema();

  // Build stable column definitions (only changes when schema changes)
  const tableColumns = useMemo(
    () => buildColumns(columnMetadata),
    [columnMetadata],
  );

  // Build params object conditionally to satisfy exactOptionalPropertyTypes
  const params = useMemo(() => {
    const result: {
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      limit: number;
      offset: number;
    } = {
      limit: pageSize,
      offset: pageIndex * pageSize,
    };

    if (globalFilter) {
      result.search = globalFilter;
    }
    if (sorting.length > 0) {
      result.sortBy = sorting[0].id;
      result.sortOrder = sorting[0].desc ? "desc" : "asc";
    }

    return result;
  }, [globalFilter, sorting, pageSize, pageIndex]);

  // Fetch data with current state
  const {
    activities,
    total,
    isLoading: dataLoading,
    isValidating,
    error: dataError,
  } = useActivities(params);

  // Combined loading and error states
  const isLoading = schemaLoading || dataLoading;
  const error = schemaError ?? dataError;

  // Calculate page count
  const pageCount = Math.ceil(total / pageSize);

  // Create table instance
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is safe for our usage
  const table = useReactTable({
    data: activities,
    columns: tableColumns,
    pageCount,
    defaultColumn: { maxSize: 300 },
    state: {
      sorting,
      columnVisibility,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      setPageIndex(0);
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  // Handle page changes
  const handlePageChange = useCallback((newPageIndex: number) => {
    setPageIndex(newPageIndex);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setGlobalFilter(value);
    setPageIndex(0);
  }, []);

  return {
    table,
    tableColumns,
    activities,
    total,
    isLoading,
    isValidating,
    error,
    globalFilter,
    pageIndex,
    pageSize,
    pageCount,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
  };
};
