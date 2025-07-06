import { toast } from "sonner";
import type { Base64ContentBlock } from "@langchain/core/messages";
import { fileToContentBlock } from "@/lib/multimodal-utils";
import { validateFiles } from "./validation";
import { ERROR_MESSAGES } from "./constants";
import { debounce } from "./debounce";

export interface FileProcessingOptions {
  showDuplicateError?: boolean;
  showInvalidTypeError?: boolean;
  resetInput?: boolean;
}

/**
 * Internal non-debounced file processing function
 */
async function processFilesInternal(
  files: File[],
  contentBlocks: Base64ContentBlock[],
  setContentBlocks: React.Dispatch<React.SetStateAction<Base64ContentBlock[]>>,
  options: FileProcessingOptions = {},
): Promise<void> {
  const { showDuplicateError = true, showInvalidTypeError = true } = options;

  if (files.length === 0) return;

  const { invalidFiles, duplicateFiles, uniqueFiles } = validateFiles(
    files,
    contentBlocks,
  );

  // Show error messages
  if (showInvalidTypeError && invalidFiles.length > 0) {
    toast.error(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }
  if (showDuplicateError && duplicateFiles.length > 0) {
    toast.error(
      ERROR_MESSAGES.DUPLICATE_FILES(duplicateFiles.map((f) => f.name)),
    );
  }

  // Process valid unique files
  if (uniqueFiles.length > 0) {
    try {
      const newBlocks = await Promise.all(uniqueFiles.map(fileToContentBlock));
      setContentBlocks((prev) => [...prev, ...newBlocks]);
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Failed to process one or more files. Please try again.");
    }
  }
}

/**
 * Debounced file processing function to prevent excessive calls
 * Default debounce delay is 300ms
 */
export const processFiles = debounce(processFilesInternal, 300);

/**
 * Helper to extract files from different input sources
 */
export const extractFilesFromSource = (
  source: File[] | FileList | DataTransferItemList,
): File[] => {
  if (Array.isArray(source)) {
    return source;
  }

  if (source instanceof FileList) {
    return Array.from(source);
  }

  // DataTransferItemList (from clipboard)
  const files: File[] = [];
  for (let i = 0; i < source.length; i += 1) {
    const item = source[i];
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  return files;
};
