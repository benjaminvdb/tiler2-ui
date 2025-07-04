import { useRef, useEffect } from "react";
import { toast } from "sonner";
import type { Base64ContentBlock } from "@langchain/core/messages";
import { fileToContentBlock } from "@/lib/multimodal-utils";
import { validateFiles } from "./validation";
import { ERROR_MESSAGES } from "./constants";

interface UseDragDropHandlersProps {
  contentBlocks: Base64ContentBlock[];
  setContentBlocks: React.Dispatch<React.SetStateAction<Base64ContentBlock[]>>;
  setDragOver: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useDragDropHandlers({
  contentBlocks,
  setContentBlocks,
  setDragOver,
}: UseDragDropHandlersProps) {
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleWindowDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setDragOver(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setDragOver(false);
      }
    };

    const handleWindowDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setDragOver(false);

      if (!e.dataTransfer) return;

      const files = Array.from(e.dataTransfer.files);
      const { invalidFiles, duplicateFiles, uniqueFiles } = validateFiles(files, contentBlocks);

      if (invalidFiles.length > 0) {
        toast.error(ERROR_MESSAGES.INVALID_FILE_TYPE);
      }
      if (duplicateFiles.length > 0) {
        toast.error(ERROR_MESSAGES.DUPLICATE_FILES(duplicateFiles.map((f) => f.name)));
      }

      const newBlocks = uniqueFiles.length
        ? await Promise.all(uniqueFiles.map(fileToContentBlock))
        : [];
      setContentBlocks((prev) => [...prev, ...newBlocks]);
    };

    const handleWindowDragEnd = (e: DragEvent) => {
      dragCounter.current = 0;
      setDragOver(false);
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);
    window.addEventListener("dragend", handleWindowDragEnd);
    window.addEventListener("dragover", handleWindowDragOver);

    return () => {
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
      window.removeEventListener("dragend", handleWindowDragEnd);
      window.removeEventListener("dragover", handleWindowDragOver);
    };
  }, [contentBlocks, setContentBlocks, setDragOver]);
}