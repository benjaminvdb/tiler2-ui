import React from "react";
import { X as XIcon } from "lucide-react";

interface RemoveButtonProps {
  onRemove?: (() => void) | undefined;
  ariaLabel: string;
  className?: string | undefined;
}

export const RemoveButton: React.FC<RemoveButtonProps> = ({
  onRemove,
  ariaLabel,
  className = "ml-2 rounded-full bg-gray-200 p-1 text-gray-500 hover:bg-gray-300",
}) => {
  return (
    <button
      type="button"
      className={className}
      onClick={onRemove}
      aria-label={ariaLabel}
    >
      <XIcon className="h-4 w-4" />
    </button>
  );
};
