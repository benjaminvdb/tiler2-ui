"use no memo";

/**
 * Activities data table component.
 *
 * A full-featured data table with server-side pagination, sorting,
 * and filtering using TanStack Table.
 */

import * as React from "react";
import { flexRender, useReactTable } from "@tanstack/react-table";

import { LoadingSpinner } from "@/shared/components/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/utils/utils";
import { useActivitiesTable } from "../hooks/use-activities-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import type { ActivityRow } from "../types";

/** Loading state component. */
const LoadingState = (): React.JSX.Element => (
  <div className="flex items-center justify-center gap-2 py-24">
    <LoadingSpinner />
    <span className="text-muted-foreground">Loading activities...</span>
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
 * Groups always exist in this table, so we always use bg-muted for headers.
 */
const getHeaderClassName = (
  isGroupHeader: boolean,
  groupId: string,
  isSticky: boolean,
  isRisk: boolean,
): string => {
  // Base sticky classes for first column (both group and regular headers)
  const stickyBase = isSticky ? "sticky left-0 z-20 bg-muted" : "";

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
    // Empty placeholder cells
    return cn(stickyBase, "whitespace-nowrap bg-background");
  }

  if (isSticky) {
    return cn(wrapClass, "sticky left-0 z-20 bg-muted");
  }
  return wrapClass;
};

/**
 * Get sticky cell className based on row index.
 * Uses opaque backgrounds to prevent stacking with row backgrounds.
 */
const getStickyClassName = (isSticky: boolean, isEvenRow: boolean): string => {
  if (!isSticky) return "";
  const bgClasses = isEvenRow ? "bg-secondary" : "bg-background";
  return cn("sticky left-0 z-10", bgClasses, "group-hover:bg-table-row-hover");
};

/** Get fixed width style for columns with custom size (not default 150). */
const getWidthStyle = (size: number): React.CSSProperties | undefined =>
  size !== 150
    ? { width: `${size}px`, minWidth: `${size}px`, maxWidth: `${size}px` }
    : undefined;

/** Get cell className combining sticky and truncate classes. */
const getCellClassName = (
  stickyClasses: string,
  hasFixedWidth: boolean,
): string =>
  hasFixedWidth ? stickyClasses : cn("max-w-[300px] truncate", stickyClasses);

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

  return (
    <div className="relative h-full overflow-auto rounded-md border">
      {isValidating && hasData && (
        <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}

      <Table>
        <TableHeader>
          {headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isGroup = header.subHeaders.length > 0;
                const isSticky =
                  header.column.columnDef.meta?.isSticky ?? false;
                const isRisk =
                  !isGroup &&
                  header.column.id.toLowerCase().startsWith("risk_");
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={getHeaderClassName(
                      isGroup,
                      header.column.id,
                      isSticky,
                      isRisk,
                    )}
                    style={getWidthStyle(header.getSize())}
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
              const isEvenRow = row.index % 2 === 1;
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSticky =
                      cell.column.columnDef.meta?.isSticky ?? false;
                    const widthStyle = getWidthStyle(cell.column.getSize());
                    return (
                      <TableCell
                        key={cell.id}
                        className={getCellClassName(
                          getStickyClassName(isSticky, isEvenRow),
                          !!widthStyle,
                        )}
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
