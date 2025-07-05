import { cn } from "@/lib/utils";
import { BaseComponentProps } from "./types";

export const hr = ({ className, ...props }: BaseComponentProps) => (
  <hr
    className={cn("my-5 border-b", className)}
    {...props}
  />
);
