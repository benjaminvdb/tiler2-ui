import React from "react";
import { File } from "lucide-react";
import { cn } from "@/lib/utils";
import { PreviewComponentProps } from "../types";
import { getIconSize } from "../utils/size-config";
import { RemoveButton } from "./remove-button";

export const PdfPreview: React.FC<PreviewComponentProps> = ({
  block,
  removable = false,
  onRemove,
  className,
  size = "md",
}) => {
  const filename = block.metadata?.filename || block.metadata?.name || "PDF file";
  
  return (
    <div
      className={cn(
        "relative flex items-start gap-2 rounded-md border bg-gray-100 px-3 py-2",
        className,
      )}
    >
      <div className="flex flex-shrink-0 flex-col items-start justify-start">
        <File
          className={cn(
            "text-teal-700",
            getIconSize(size),
          )}
        />
      </div>
      <span
        className={cn("min-w-0 flex-1 text-sm break-all text-gray-800")}
        style={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}
      >
        {String(filename)}
      </span>
      {removable && (
        <RemoveButton
          onRemove={onRemove}
          ariaLabel="Remove PDF"
          className="ml-2 self-start rounded-full bg-gray-200 p-1 text-teal-700 hover:bg-gray-300"
        />
      )}
    </div>
  );
};