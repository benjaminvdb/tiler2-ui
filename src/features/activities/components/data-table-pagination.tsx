/**
 * Pagination controls for the data table.
 */

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const PAGE_SIZES = [10, 25, 50, 100] as const;

/** Page size selector component. */
const PageSizeSelect = ({
  pageSize,
  onPageSizeChange,
  disabled,
}: {
  pageSize: number;
  onPageSizeChange: (value: string) => void;
  disabled: boolean;
}): React.JSX.Element => (
  <div className="flex items-center space-x-2">
    <p className="text-sm font-medium">Rows per page</p>
    <Select
      value={pageSize.toString()}
      onValueChange={onPageSizeChange}
      disabled={disabled}
    >
      <SelectTrigger className="h-8 w-[70px]">
        <SelectValue placeholder={pageSize.toString()} />
      </SelectTrigger>
      <SelectContent side="top">
        {PAGE_SIZES.map((size) => (
          <SelectItem
            key={size}
            value={size.toString()}
          >
            {size}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

/** Navigation buttons component. */
const NavigationButtons = ({
  onFirst,
  onPrevious,
  onNext,
  onLast,
  canGoPrevious,
  canGoNext,
  disabled,
}: {
  onFirst: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onLast: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  disabled: boolean;
}): React.JSX.Element => (
  <div className="flex items-center space-x-2">
    <Button
      variant="outline"
      className="hidden h-8 w-8 p-0 lg:flex"
      onClick={onFirst}
      disabled={disabled || !canGoPrevious}
    >
      <span className="sr-only">Go to first page</span>
      <ChevronsLeft className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      className="h-8 w-8 p-0"
      onClick={onPrevious}
      disabled={disabled || !canGoPrevious}
    >
      <span className="sr-only">Go to previous page</span>
      <ChevronLeft className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      className="h-8 w-8 p-0"
      onClick={onNext}
      disabled={disabled || !canGoNext}
    >
      <span className="sr-only">Go to next page</span>
      <ChevronRight className="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      className="hidden h-8 w-8 p-0 lg:flex"
      onClick={onLast}
      disabled={disabled || !canGoNext}
    >
      <span className="sr-only">Go to last page</span>
      <ChevronsRight className="h-4 w-4" />
    </Button>
  </div>
);

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  disabled?: boolean;
}

/** Pagination controls with page size selector and navigation buttons. */
export const DataTablePagination = ({
  pageIndex,
  pageSize,
  totalItems,
  pageCount,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}: DataTablePaginationProps): React.JSX.Element => {
  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;
  const startItem = totalItems > 0 ? pageIndex * pageSize + 1 : 0;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  const handlePageSizeChange = (value: string) => onPageSizeChange(Number(value));
  const handleFirst = () => onPageChange(0);
  const handlePrevious = () => onPageChange(pageIndex - 1);
  const handleNext = () => onPageChange(pageIndex + 1);
  const handleLast = () => onPageChange(pageCount - 1);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-muted-foreground flex-1 text-sm">
        {totalItems > 0
          ? `Showing ${startItem} to ${endItem} of ${totalItems.toLocaleString()} rows`
          : "No results"}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <PageSizeSelect
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          disabled={disabled}
        />
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {pageIndex + 1} of {Math.max(1, pageCount)}
        </div>
        <NavigationButtons
          onFirst={handleFirst}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onLast={handleLast}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
