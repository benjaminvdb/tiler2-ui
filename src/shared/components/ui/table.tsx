import * as React from "react";

import { cn } from "@/shared/utils/utils";

type TableProps = React.ComponentProps<"table">;

const Table: React.FC<TableProps> = ({ className, ...props }) => (
  <table
    data-slot="table"
    className={cn("w-full caption-bottom text-sm", className)}
    {...props}
  />
);

type TableHeaderProps = React.ComponentProps<"thead">;

const TableHeader: React.FC<TableHeaderProps> = ({ className, ...props }) => (
  <thead
    data-slot="table-header"
    className={cn("bg-muted sticky top-0 z-20 [&_tr]:border-b", className)}
    {...props}
  />
);

type TableBodyProps = React.ComponentProps<"tbody">;

const TableBody: React.FC<TableBodyProps> = ({ className, ...props }) => (
  <tbody
    data-slot="table-body"
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
);

type TableFooterProps = React.ComponentProps<"tfoot">;

const TableFooter: React.FC<TableFooterProps> = ({ className, ...props }) => (
  <tfoot
    data-slot="table-footer"
    className={cn(
      "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
      className,
    )}
    {...props}
  />
);

type TableRowProps = React.ComponentProps<"tr">;

const TableRow: React.FC<TableRowProps> = ({ className, ...props }) => (
  <tr
    data-slot="table-row"
    className={cn(
      "group border-b transition-colors",
      "even:bg-muted/30",
      "hover:bg-muted/50 data-[state=selected]:bg-muted",
      className,
    )}
    {...props}
  />
);

type TableHeadProps = React.ComponentProps<"th">;

const TableHead: React.FC<TableHeadProps> = ({ className, ...props }) => (
  <th
    data-slot="table-head"
    className={cn(
      "text-foreground h-10 px-4 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
);

type TableCellProps = React.ComponentProps<"td">;

const TableCell: React.FC<TableCellProps> = ({ className, ...props }) => (
  <td
    data-slot="table-cell"
    className={cn(
      "p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className,
    )}
    {...props}
  />
);

type TableCaptionProps = React.ComponentProps<"caption">;

const TableCaption: React.FC<TableCaptionProps> = ({ className, ...props }) => (
  <caption
    data-slot="table-caption"
    className={cn("text-muted-foreground mt-4 text-sm", className)}
    {...props}
  />
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
