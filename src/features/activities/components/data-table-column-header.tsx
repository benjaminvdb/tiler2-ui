/**
 * Sortable column header component for the data table.
 *
 * Provides visual indicators and click handlers for column sorting.
 */

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { cn } from "@/shared/utils/utils";
import { Button } from "@/shared/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  unit?: string;
  className?: string;
  isSticky?: boolean;
  /** Allow header text to wrap to multiple lines */
  allowWrap?: boolean;
}

/**
 * Column header with sorting controls.
 *
 * Shows sort direction indicator and allows toggling sort on click.
 */
export const DataTableColumnHeader = <TData, TValue>({
  column,
  title,
  unit,
  className,
  isSticky,
  allowWrap,
}: DataTableColumnHeaderProps<TData, TValue>): React.JSX.Element => {
  const handleClick = React.useCallback(() => {
    column.toggleSorting(column.getIsSorted() === "asc");
  }, [column]);

  const stickyClasses = isSticky ? "sticky left-0 z-20 bg-muted" : "";
  const wrapClasses = allowWrap ? "whitespace-normal text-left" : "";

  if (!column.getCanSort()) {
    return (
      <div className={cn(stickyClasses, wrapClasses, className)}>
        <div>{title}</div>
        {unit && <div className="text-muted-foreground text-xs">{unit}</div>}
      </div>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "data-[state=open]:bg-accent -ml-3",
        allowWrap ? "h-auto py-1" : "h-8",
        stickyClasses,
        className,
      )}
      onClick={handleClick}
    >
      <div className={cn("flex flex-col items-start gap-0", wrapClasses)}>
        <span>{title}</span>
        {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
      </div>
      {sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4 shrink-0" />
      ) : sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4 shrink-0" />
      ) : (
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
      )}
    </Button>
  );
};
