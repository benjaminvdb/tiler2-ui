import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/utils/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Risk level variants (1-5 scale)
        risk1:
          "border-transparent bg-[#5BB2BA] text-[#1F4A4D] dark:bg-[#5BB2BA]/80 dark:text-[#1F4A4D]",
        risk2:
          "border-transparent bg-[#9DD7D7] text-[#276060] dark:bg-[#9DD7D7]/80 dark:text-[#276060]",
        risk3:
          "border-transparent bg-[#EBD5A1] text-[#795D19] dark:bg-[#EBD5A1]/80 dark:text-[#795D19]",
        risk4:
          "border-transparent bg-[#E6AC83] text-[#7B4219] dark:bg-[#E6AC83]/80 dark:text-[#7B4219]",
        risk5:
          "border-transparent bg-[#E08670] text-[#5A2215] dark:bg-[#E08670]/80 dark:text-[#5A2215]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type BadgeProps = React.ComponentProps<"div"> &
  VariantProps<typeof badgeVariants>;

const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- Exporting variants alongside component for reusability
export { Badge, badgeVariants, type BadgeProps };
