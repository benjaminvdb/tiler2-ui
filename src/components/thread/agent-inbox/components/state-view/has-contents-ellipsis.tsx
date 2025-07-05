import { cn } from "@/lib/utils";

interface HasContentsEllipsisProps {
  onClick?: () => void;
}

export function HasContentsEllipsis({ onClick }: HasContentsEllipsisProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "rounded-md p-[2px] font-mono text-[10px] leading-3",
        "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800",
        "cursor-pointer transition-colors ease-in-out",
        "inline-block -translate-y-[2px]",
      )}
    >
      {"{...}"}
    </span>
  );
}
