import { cva, type VariantProps } from "class-variance-authority";
import { Plus } from "lucide-react";

import { cn } from "@/shared/utils/utils";

const addItemButtonVariants = cva(
  "flex w-full items-center justify-center gap-2 border border-dashed border-[var(--border)] text-[var(--muted-foreground)] transition-all duration-200 hover:border-[var(--sage)] hover:text-[var(--foreground)]",
  {
    variants: {
      size: {
        sm: "rounded-lg p-3 text-sm",
        default: "rounded-xl p-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

type AddItemButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof addItemButtonVariants> & {
    label: string;
  };

export const AddItemButton = ({
  label,
  size,
  className,
  ...props
}: AddItemButtonProps): React.JSX.Element => {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      className={cn(addItemButtonVariants({ size }), className)}
      {...props}
    >
      <Plus className={iconSize} />
      {label}
    </button>
  );
};
