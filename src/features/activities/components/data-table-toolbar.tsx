"use no memo";

/**
 * Toolbar for the data table.
 *
 * Provides search input, column visibility toggle, and other controls.
 */

import * as React from "react";
import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  /** Current search value (controlled) */
  searchValue: string;
  /** Callback when search value changes */
  onSearchChange: (value: string) => void;
  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Whether search is disabled */
  disabled?: boolean;
}

/**
 * Toolbar with search input and column visibility toggle.
 *
 * Search is debounced to avoid excessive API calls.
 */
export const DataTableToolbar = <TData,>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  disabled = false,
}: DataTableToolbarProps<TData>): React.JSX.Element => {
  // Local state for debounced search - key on searchValue to reset when cleared externally
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Debounce search input - fire after 300ms of no typing
  useEffect(() => {
    // Skip the initial render and when value matches (already synced)
    if (localSearch === searchValue) return;

    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, searchValue, onSearchChange]);

  const isFiltered = searchValue.length > 0;

  // Handlers
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setLocalSearch(e.target.value),
    [],
  );

  const handleClearSearch = React.useCallback(() => {
    setLocalSearch("");
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={handleInputChange}
            className="h-9 pr-8 pl-8"
            disabled={disabled}
          />
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 h-9 w-9 p-0"
              onClick={handleClearSearch}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>
      <ColumnVisibilityMenu table={table} />
    </div>
  );
};

/**
 * Column visibility menu item component.
 */
interface ColumnMenuItemProps<TData> {
  column: ReturnType<Table<TData>["getAllLeafColumns"]>[number];
}

const ColumnMenuItem = <TData,>({
  column,
}: ColumnMenuItemProps<TData>): React.JSX.Element => {
  const handleCheckedChange = React.useCallback(
    (value: boolean) => {
      column.toggleVisibility(!!value);
    },
    [column],
  );

  const handleSelect = React.useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  return (
    <DropdownMenuCheckboxItem
      key={column.id}
      className="capitalize"
      checked={column.getIsVisible()}
      onCheckedChange={handleCheckedChange}
      onSelect={handleSelect}
    >
      {formatColumnName(column.id)}
    </DropdownMenuCheckboxItem>
  );
};

/**
 * Column visibility dropdown menu.
 *
 * Follows the shadcn/ui data-table pattern for column visibility toggles.
 */
const ColumnVisibilityMenu = <TData,>({
  table,
}: {
  table: Table<TData>;
}): React.JSX.Element => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-9 lg:flex"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[180px]"
      >
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <ColumnMenuItem
              key={column.id}
              column={column}
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Format a column ID for display.
 * Converts snake_case to Title Case.
 */
function formatColumnName(columnId: string): string {
  return columnId
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
