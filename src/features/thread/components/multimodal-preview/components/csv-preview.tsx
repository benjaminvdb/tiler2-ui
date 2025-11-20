import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import { PreviewComponentProps } from "../types";
import { getIconSize } from "../utils/size-config";
import { RemoveButton } from "./remove-button";

export const CsvPreview: React.FC<PreviewComponentProps> = ({
  block,
  removable = false,
  onRemove,
  className,
  size = "md",
}) => {
  const filename =
    block.metadata?.filename || block.metadata?.name || "CSV file";

  return (
    <div
      className={cn(
        "relative flex items-start gap-2 rounded-md border bg-gray-100 px-3 py-2",
        className,
      )}
    >
      <div className="flex flex-shrink-0 flex-col items-start justify-start">
        <FileSpreadsheet className={cn("text-green-700", getIconSize(size))} />
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
          ariaLabel="Remove CSV"
          className="ml-2 self-start rounded-full bg-gray-200 p-1 text-green-700 hover:bg-gray-300"
        />
      )}
    </div>
  );
};
