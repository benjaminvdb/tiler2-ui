/** Skeleton loading placeholder component with pulse animation. */

import { cn } from "@/shared/utils/utils";

const Skeleton = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-primary/10 animate-pulse rounded-md", className)}
      {...props}
    />
  );
};

export { Skeleton };
