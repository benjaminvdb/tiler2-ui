import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PreviewComponentProps } from "../types";
import { getImageSizeConfig } from "../utils/size-config";
import { RemoveButton } from "./remove-button";

export const ImagePreview: React.FC<PreviewComponentProps> = ({
  block,
  removable = false,
  onRemove,
  className,
  size = "md",
}) => {
  const url = `data:${block.mime_type};base64,${block.data}`;
  const sizeConfig = getImageSizeConfig(size);
  
  return (
    <div className={cn("relative inline-block", className)}>
      <Image
        src={url}
        alt={String(block.metadata?.name || "uploaded image")}
        className={sizeConfig.className}
        width={sizeConfig.width}
        height={sizeConfig.height}
      />
      {removable && (
        <RemoveButton
          onRemove={onRemove}
          ariaLabel="Remove image"
          className="absolute top-1 right-1 z-10 rounded-full bg-gray-500 text-white hover:bg-gray-700"
        />
      )}
    </div>
  );
};