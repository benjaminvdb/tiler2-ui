import React from "react";
import { File } from "lucide-react";
import { cn } from "@/lib/utils";
import { PreviewComponentProps } from "../types";
import { RemoveButton } from "./remove-button";

export const FallbackPreview: React.FC<PreviewComponentProps> = ({
  removable = false,
  onRemove,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-gray-100 px-3 py-2 text-gray-500",
        className,
      )}
    >
      <File className="h-5 w-5 flex-shrink-0" />
      <span className="truncate text-xs">Unsupported file type</span>
      {removable && (
        <RemoveButton
          onRemove={onRemove}
          ariaLabel="Remove file"
        />
      )}
    </div>
  );
};