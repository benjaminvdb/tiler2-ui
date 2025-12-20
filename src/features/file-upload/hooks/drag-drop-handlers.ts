/** Manages drag-and-drop events for file uploads with visual feedback. */

import { useRef, useEffect, RefObject, useCallback } from "react";
import type { MultimodalContentBlock } from "@/shared/types";
import { processFiles } from "./file-processor";

interface UseDragDropHandlersProps {
  contentBlocks: MultimodalContentBlock[];
  setContentBlocks: React.Dispatch<
    React.SetStateAction<MultimodalContentBlock[]>
  >;
  setDragOver: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef: RefObject<HTMLElement | null>;
}

/**
 * Hook that attaches drag-and-drop event listeners to a container element.
 * Uses a drag counter to handle nested drag events correctly.
 */
export function useDragDropHandlers({
  contentBlocks,
  setContentBlocks,
  setDragOver,
  containerRef,
}: UseDragDropHandlersProps) {
  const dragCounter = useRef(0);

  const handleDrop = useCallback(
    async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setDragOver(false);

      if (!e.dataTransfer) return;

      const files = Array.from(e.dataTransfer.files);
      await processFiles(files, contentBlocks, setContentBlocks);
    },
    [contentBlocks, setContentBlocks, setDragOver],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setDragOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setDragOver(false);
      }
    };

    const handleDragEnd = (_e: DragEvent) => {
      dragCounter.current = 0;
      setDragOver(false);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    container.addEventListener("dragenter", handleDragEnter);
    container.addEventListener("dragleave", handleDragLeave);
    container.addEventListener("drop", handleDrop);
    container.addEventListener("dragend", handleDragEnd);
    container.addEventListener("dragover", handleDragOver);

    return () => {
      container.removeEventListener("dragenter", handleDragEnter);
      container.removeEventListener("dragleave", handleDragLeave);
      container.removeEventListener("drop", handleDrop);
      container.removeEventListener("dragend", handleDragEnd);
      container.removeEventListener("dragover", handleDragOver);

      dragCounter.current = 0;
    };
  }, [handleDrop, setDragOver, containerRef]);
}
