"use no memo";

/**
 * Activities data table component.
 *
 * A full-featured data table with server-side pagination, sorting,
 * and filtering using TanStack Table.
 */

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowData,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/utils";
import { useActivities } from "../hooks/use-activities";
import { useActivitySchema } from "../hooks/use-activity-schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import type { ActivityRow, ColumnMetadata } from "../types";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    isSticky?: boolean;
  }
}

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
      // Format numbers with appropriate precision
      return num.toLocaleString(undefined, {
        maximumFractionDigits: 4,
      });
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

/**
 * Get the text label for a risk score (1-5).
 */
function getRiskLabel(risk: number): string {
  const RISK_LABELS: Record<number, string> = {
    1: "Low",
    2: "Low-medium",
    3: "Medium-high",
    4: "High",
    5: "Extremely high",
  };

  return RISK_LABELS[risk] ?? String(risk);
}

/**
 * Render a risk badge for risk columns.
 */
const RiskBadge = ({ value }: { value: unknown }): React.JSX.Element => {
  const risk = Number(value);
  if (isNaN(risk) || risk < 1 || risk > 5) {
    return <span>{String(value)}</span>;
  }

  const riskVariant = `risk${risk}` as
    | "risk1"
    | "risk2"
    | "risk3"
    | "risk4"
    | "risk5";

  return (
    <Badge variant={riskVariant} className="w-full justify-center">
      {getRiskLabel(risk)}
    </Badge>
  );
};

/**
 * Check if a column should be rendered as a risk badge.
 */
function isRiskColumn(columnName: string): boolean {
  return columnName.toLowerCase().startsWith("risk_");
}

/**
 * Check if a column is an impact column.
 */
function isImpactColumn(columnName: string): boolean {
  return columnName.toLowerCase().startsWith("impact_");
}

/**
 * Check if a column is an LCIA column.
 */
function isLciaColumn(columnName: string): boolean {
  return columnName.toLowerCase().startsWith("lcia_");
}

const columnHelper = createColumnHelper<ActivityRow>();

// Fixed width for risk columns - sized for "Extremely high" label (bold text + padding)
const RISK_COLUMN_WIDTH = 130;

/**
 * Build a single column definition from column metadata.
 */
function buildSingleColumn(col: ColumnMetadata): ColumnDef<ActivityRow> {
  const unit = getColumnUnit(col.name);
  const isSticky = col.name === "activity_name";
  const isRisk = isRiskColumn(col.name);

  // Strip group prefixes from column titles since they're clear from group headers
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
    // Fixed width for risk columns to fit "Extremely high" badge
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
    meta: {
      isSticky,
    },
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
  // Filter out internal ID columns - they should never be visible to users
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
    if (a.name === "activity_name") return -1;
    if (b.name === "activity_name") return 1;
    return 0;
  });

  const columns: ColumnDef<ActivityRow>[] = [];

  // Add standalone columns first (activity_name first, then others)
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

/**
 * Format a column name for display as a header.
 */
function formatColumnTitle(columnName: string): string {
  return columnName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get the unit label for an impact column.
 */
function getColumnUnit(columnName: string): string | undefined {
  const IMPACT_UNITS: Record<string, string> = {
    impact_soil_pollution: "kg SO₂-eq",
    impact_climate_change: "kg CO₂-eq",
    impact_water_pollution: "kg P-eq",
    impact_land_use: "m²",
    impact_water_use: "m³",
  };

  return IMPACT_UNITS[columnName];
}

/**
 * Hook for managing activities table state and data fetching.
 */
const useActivitiesTable = () => {
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

  // Fetch data with current state (rows only, no columns)
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
    defaultColumn: {
      maxSize: 300,
    },
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

/**
 * Loading state component.
 */
const LoadingState = (): React.JSX.Element => (
  <div className="flex items-center justify-center py-24">
    <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    <span className="text-muted-foreground ml-2">Loading activities...</span>
  </div>
);

/**
 * Error state component.
 */
const ErrorState = ({ message }: { message?: string }): React.JSX.Element => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <p className="text-destructive font-medium">Failed to load activities</p>
    <p className="text-muted-foreground mt-1 text-sm">
      {message || "Please try again later."}
    </p>
  </div>
);

/**
 * Empty state component.
 */
const EmptyState = (): React.JSX.Element => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <p className="text-muted-foreground">No activities found</p>
    <p className="text-muted-foreground mt-1 text-sm">
      Your activities data will appear here once uploaded.
    </p>
  </div>
);

interface TableContentProps {
  table: ReturnType<typeof useReactTable<ActivityRow>>;
  columnCount: number;
  globalFilter: string;
  isValidating: boolean;
  hasData: boolean;
}

/**
 * Get header className based on header type and properties.
 */
const getHeaderClassName = (
  isGroupHeader: boolean,
  groupId: string,
  isSticky: boolean,
  isRisk: boolean,
  hasVisibleGroupHeaders: boolean,
): string => {
  // Use bg-muted when group headers are visible, bg-background when not
  // This ensures header blends with page background when no groups exist
  const headerBg = hasVisibleGroupHeaders ? "bg-muted" : "bg-background";

  // Base sticky classes for first column (both group and regular headers)
  const stickyBase = isSticky ? `sticky left-0 z-20 ${headerBg}` : "";

  // Risk columns: allow text wrapping for multi-line headers
  // Other columns: prevent wrapping
  const wrapClass = isRisk
    ? "whitespace-normal break-words"
    : "whitespace-nowrap";

  if (isGroupHeader) {
    if (groupId === "lcia") {
      return cn(stickyBase, "whitespace-nowrap bg-gray-100 dark:bg-gray-950");
    }
    if (groupId === "impacts") {
      // Use "Medium-high" risk color (risk3)
      return cn(
        stickyBase,
        "whitespace-nowrap bg-[#EBD5A1] dark:bg-[#EBD5A1]/80",
      );
    }
    if (groupId === "risks") {
      // Use "Extremely high" risk color (risk5)
      return cn(
        stickyBase,
        "whitespace-nowrap bg-[#E08670] dark:bg-[#E08670]/80",
      );
    }
    // Empty placeholder cells (like first column's group row cell)
    // Use bg-background so it blends with the page when no colored group headers are visible
    return cn(stickyBase, "whitespace-nowrap bg-background");
  }

  if (isSticky) {
    return cn(wrapClass, `sticky left-0 z-20 ${headerBg}`);
  }
  return wrapClass;
};

/**
 * Get sticky cell className based on row index.
 * Uses opaque backgrounds to prevent stacking with row backgrounds.
 */
const getStickyClassName = (isSticky: boolean, isEvenRow: boolean): string => {
  if (!isSticky) return "";

  // Use OPAQUE backgrounds to prevent double-stacking with row background
  // bg-secondary approximates bg-muted/30 over bg-background
  // bg-table-row-hover is pre-computed bg-muted/50 over bg-background
  const baseClasses = "sticky left-0 z-10";
  const bgClasses = isEvenRow ? "bg-secondary" : "bg-background";
  const hoverClasses = "group-hover:bg-table-row-hover";

  return cn(baseClasses, bgClasses, hoverClasses);
};

/**
 * Table content with loading overlay.
 */
const TableContent = ({
  table,
  columnCount,
  globalFilter,
  isValidating,
  hasData,
}: TableContentProps): React.JSX.Element => {
  const headerGroups = table.getHeaderGroups();

  // Check if there are visible group headers (non-placeholder headers in first row when multiple rows exist)
  // When groups exist: row 0 has group headers + placeholders, row 1 has column headers
  // When no groups: row 0 has only column headers (no placeholders)
  // We only want bg-muted when actual group header text (like "ENVIRONMENTAL IMPACTS") is visible
  const hasVisibleGroupHeaders =
    headerGroups.length > 1 &&
    headerGroups[0].headers.some((header) => !header.isPlaceholder);

  return (
    <div className="relative h-full overflow-auto rounded-md border">
      {isValidating && hasData && (
        <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      )}

      <Table>
        <TableHeader className={!hasVisibleGroupHeaders ? "bg-background" : undefined}>
        {headerGroups.map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const isGroupHeader = header.subHeaders.length > 0;
              const groupId = header.column.id;
              const isSticky = header.column.columnDef.meta?.isSticky ?? false;
              const columnId = header.column.id;
              // Risk columns have fixed width and wrapping headers
              const isRisk =
                !isGroupHeader && columnId.toLowerCase().startsWith("risk_");
              const headerClassName = getHeaderClassName(
                isGroupHeader,
                groupId,
                isSticky,
                isRisk,
                hasVisibleGroupHeaders,
              );

              // Apply fixed width for columns with custom size (not default 150)
              const columnSize = header.getSize();
              const hasCustomSize = columnSize !== 150;
              const widthStyle = hasCustomSize
                ? {
                    width: `${columnSize}px`,
                    minWidth: `${columnSize}px`,
                    maxWidth: `${columnSize}px`,
                  }
                : undefined;

              return (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className={headerClassName}
                  style={widthStyle}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const isEvenRow = row.index % 2 === 1; // 0-indexed, CSS even rows

            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => {
                  const isSticky =
                    cell.column.columnDef.meta?.isSticky ?? false;
                  const cellStickyClasses = getStickyClassName(
                    isSticky,
                    isEvenRow,
                  );

                  // Apply fixed width for columns with custom size (not default 150)
                  const columnSize = cell.column.getSize();
                  const hasCustomSize = columnSize !== 150;
                  const widthStyle = hasCustomSize
                    ? {
                        width: `${columnSize}px`,
                        minWidth: `${columnSize}px`,
                        maxWidth: `${columnSize}px`,
                      }
                    : undefined;

                  // Risk columns show badges - don't truncate
                  const cellClasses = hasCustomSize
                    ? cellStickyClasses
                    : cn("max-w-[300px] truncate", cellStickyClasses);

                  return (
                    <TableCell
                      key={cell.id}
                      className={cellClasses}
                      style={widthStyle}
                      title={String(cell.getValue() ?? "")}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={columnCount}
              className="h-24 text-center"
            >
              {globalFilter ? "No results found." : "No data available."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
  );
};

/**
 * Activities data table with server-side pagination and sorting.
 */
export const ActivitiesDataTable = (): React.JSX.Element => {
  const {
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
  } = useActivitiesTable();

  if (isLoading && activities.length === 0) {
    return <LoadingState />;
  }

  if (error && activities.length === 0) {
    return <ErrorState message={error.message} />;
  }

  if (!isLoading && activities.length === 0 && !globalFilter) {
    return <EmptyState />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0">
        <DataTableToolbar
          table={table}
          searchValue={globalFilter}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search activities..."
          disabled={isLoading}
        />
      </div>

      <div className="min-h-0 flex-1 py-4">
        <TableContent
          table={table}
          columnCount={tableColumns.length}
          globalFilter={globalFilter}
          isValidating={isValidating}
          hasData={activities.length > 0}
        />
      </div>

      <div className="shrink-0">
        <DataTablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalItems={total}
          pageCount={pageCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          disabled={isLoading || isValidating}
        />
      </div>
    </div>
  );
};
