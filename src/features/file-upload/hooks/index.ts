/** Main file upload hook that orchestrates drag-drop and file input handling. */

import { useState, useRef } from "react";
import type { MultimodalContentBlock } from "@/shared/types";
import { useDragDropHandlers } from "./drag-drop-handlers";
import { useFileHandlers } from "./file-handlers";

interface UseFileUploadOptions {
  initialBlocks?: MultimodalContentBlock[];
}

export function useFileUpload({
  initialBlocks = [],
}: UseFileUploadOptions = {}) {
  const [contentBlocks, setContentBlocks] =
    useState<MultimodalContentBlock[]>(initialBlocks);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useDragDropHandlers({
    contentBlocks,
    setContentBlocks,
    setDragOver,
    containerRef: dropRef,
  });

  const { handleFileUpload, handlePaste, removeBlock, resetBlocks } =
    useFileHandlers({
      contentBlocks,
      setContentBlocks,
    });

  return {
    contentBlocks,
    setContentBlocks,
    handleFileUpload,
    dropRef,
    removeBlock,
    resetBlocks,
    dragOver,
    handlePaste,
  };
}
