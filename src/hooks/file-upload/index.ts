import { useState, useRef } from "react";
import type { Base64ContentBlock } from "@langchain/core/messages";
import { useDragDropHandlers } from "./drag-drop-handlers";
import { useFileHandlers } from "./file-handlers";

// Re-export constants for backward compatibility
export { SUPPORTED_FILE_TYPES } from "./constants";

interface UseFileUploadOptions {
  initialBlocks?: Base64ContentBlock[];
}

export function useFileUpload({
  initialBlocks = [],
}: UseFileUploadOptions = {}) {
  const [contentBlocks, setContentBlocks] =
    useState<Base64ContentBlock[]>(initialBlocks);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Use modular handlers
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
