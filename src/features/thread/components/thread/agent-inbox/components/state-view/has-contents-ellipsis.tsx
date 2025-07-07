import { cn } from "@/shared/utils/utils";

interface HasContentsEllipsisProps {
  onClick?: () => void;
}
export const HasContentsEllipsis: React.FC<HasContentsEllipsisProps> = ({
  onClick,
}) => {
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
};
