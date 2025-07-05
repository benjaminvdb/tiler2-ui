import { cn } from "@/lib/utils";
import { BaseComponentProps } from "../types";

export const p = ({ className, ...props }: BaseComponentProps) => (
  <p
    className={cn("mt-5 mb-5 leading-7 first:mt-0 last:mb-0", className)}
    {...props}
  />
);

export const a = ({ className, ...props }: BaseComponentProps) => (
  <a
    className={cn(
      "text-primary font-medium underline underline-offset-4",
      className,
    )}
    {...props}
  />
);

export const blockquote = ({ className, ...props }: BaseComponentProps) => (
  <blockquote
    className={cn("border-l-2 pl-6 italic", className)}
    {...props}
  />
);