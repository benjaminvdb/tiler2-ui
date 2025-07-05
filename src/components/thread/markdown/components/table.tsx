import { cn } from "@/lib/utils";
import { BaseComponentProps } from "./types";

export const table = ({ className, ...props }: BaseComponentProps) => (
  <div className="my-6 w-full overflow-y-auto">
    <table
      className={cn("w-full overflow-hidden", className)}
      {...props}
    />
  </div>
);

export const tr = ({ className, ...props }: BaseComponentProps) => (
  <tr
    className={cn("even:bg-muted m-0 border-t p-0", className)}
    {...props}
  />
);

export const th = ({ className, ...props }: BaseComponentProps) => (
  <th
    className={cn(
      "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
      className,
    )}
    {...props}
  />
);

export const td = ({ className, ...props }: BaseComponentProps) => (
  <td
    className={cn(
      "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
      className,
    )}
    {...props}
  />
);
