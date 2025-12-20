/** Provides handlers for file input, paste events, and content block management. */

import { ChangeEvent } from "react";
import { toast } from "sonner";
import type { MultimodalContentBlock } from "@/shared/types";
import { processFiles, extractFilesFromSource } from "./file-processor";
import { ERROR_MESSAGES, SUPPORTED_FILE_TYPES } from "./constants";

interface UseFileHandlersProps {
  contentBlocks: MultimodalContentBlock[];
  setContentBlocks: React.Dispatch<
    React.SetStateAction<MultimodalContentBlock[]>
  >;
}

/**
 * Hook that returns handlers for file uploads, paste events, and block removal.
 * Paste events show different error messages than file uploads for better UX.
 */
export function useFileHandlers({
  contentBlocks,
  setContentBlocks,
}: UseFileHandlersProps) {
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = extractFilesFromSource(files);
    await processFiles(fileArray, contentBlocks, setContentBlocks);
    e.target.value = "";
  };

  const handlePaste = async (
    e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const items = e.clipboardData.items;
    if (!items) return;

    const files = extractFilesFromSource(items);
    if (files.length === 0) return;

    e.preventDefault();

    await processFiles(files, contentBlocks, setContentBlocks, {
      showInvalidTypeError: false,
    });

    const invalidFiles = files.filter(
      (file) => !SUPPORTED_FILE_TYPES.includes(file.type),
    );
    if (invalidFiles.length > 0) {
      toast.error(ERROR_MESSAGES.INVALID_PASTE_TYPE);
    }
  };

  const removeBlock = (idx: number) => {
    setContentBlocks((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetBlocks = () => setContentBlocks([]);

  return {
    handleFileUpload,
    handlePaste,
    removeBlock,
    resetBlocks,
  };
}
