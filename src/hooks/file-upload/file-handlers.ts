import { ChangeEvent } from "react";
import { toast } from "sonner";
import type { Base64ContentBlock } from "@langchain/core/messages";
import { processFiles, extractFilesFromSource } from "./file-processor";
import { ERROR_MESSAGES, SUPPORTED_FILE_TYPES } from "./constants";

interface UseFileHandlersProps {
  contentBlocks: Base64ContentBlock[];
  setContentBlocks: React.Dispatch<React.SetStateAction<Base64ContentBlock[]>>;
}

export function useFileHandlers({
  contentBlocks,
  setContentBlocks,
}: UseFileHandlersProps) {
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = extractFilesFromSource(files);
    await processFiles(fileArray, contentBlocks, setContentBlocks);

    // Reset the input value to allow re-uploading the same file
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

    // Use custom error message for paste operations
    await processFiles(files, contentBlocks, setContentBlocks, {
      showInvalidTypeError: false, // Handle custom error message
    });

    // Show custom paste error message if needed
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
