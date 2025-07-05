import { cn } from "@/lib/utils";
import { BaseComponentProps } from "../types";

export const ul = ({ className, ...props }: BaseComponentProps) => (
  <ul
    className={cn("my-5 ml-6 list-disc [&>li]:mt-2", className)}
    {...props}
  />
);

export const ol = ({ className, ...props }: BaseComponentProps) => (
  <ol
    className={cn("my-5 ml-6 list-decimal [&>li]:mt-2", className)}
    {...props}
  />
);