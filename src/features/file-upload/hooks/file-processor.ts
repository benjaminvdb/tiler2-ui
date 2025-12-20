/** Core file processing logic with validation, deduplication, and error handling. */

import { toast } from "sonner";
import type { MultimodalContentBlock } from "@/shared/types";
import { fileToContentBlock } from "@/features/file-upload/services/multimodal-utils";
import { validateFiles } from "./validation";
import { ERROR_MESSAGES } from "./constants";
import { debounce } from "./debounce";
import { observability } from "@/core/services/observability";

const logger = observability.child({
  component: "file-processor",
});

export interface FileProcessingOptions {
  showDuplicateError?: boolean;
  showInvalidTypeError?: boolean;
  resetInput?: boolean;
}

/**
 * Display error toasts for invalid and duplicate files
 */
function showFileErrors(
  invalidFiles: File[],
  duplicateFiles: File[],
  showInvalidTypeError: boolean,
  showDuplicateError: boolean,
): void {
  if (showInvalidTypeError && invalidFiles.length > 0) {
    toast.error(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }
  if (showDuplicateError && duplicateFiles.length > 0) {
    toast.error(
      ERROR_MESSAGES.DUPLICATE_FILES(duplicateFiles.map((f) => f.name)),
    );
  }
}

/**
 * Convert files to content blocks and add to state
 */
async function addFilesToContentBlocks(
  files: File[],
  setContentBlocks: React.Dispatch<
    React.SetStateAction<MultimodalContentBlock[]>
  >,
): Promise<void> {
  try {
    const newBlocks = await Promise.all(files.map(fileToContentBlock));
    setContentBlocks((prev) => [...prev, ...newBlocks]);
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), {
      operation: "process_files",
      additionalData: { fileCount: files.length },
    });
    toast.error("Failed to process one or more files. Please try again.");
  }
}

async function processFilesInternal(
  files: File[],
  contentBlocks: MultimodalContentBlock[],
  setContentBlocks: React.Dispatch<
    React.SetStateAction<MultimodalContentBlock[]>
  >,
  options: FileProcessingOptions = {},
): Promise<void> {
  const { showDuplicateError = true, showInvalidTypeError = true } = options;

  if (files.length === 0) return;

  const { invalidFiles, duplicateFiles, uniqueFiles } = validateFiles(
    files,
    contentBlocks,
  );

  showFileErrors(
    invalidFiles,
    duplicateFiles,
    showInvalidTypeError,
    showDuplicateError,
  );

  if (uniqueFiles.length > 0) {
    await addFilesToContentBlocks(uniqueFiles, setContentBlocks);
  }
}

const FILE_DEBOUNCE_MS = 300;
export const processFiles = debounce(
  processFilesInternal as (...args: unknown[]) => unknown,
  FILE_DEBOUNCE_MS,
) as typeof processFilesInternal;

/**
 * Normalizes different file source types into a File array.
 * Handles File[], FileList (from input), and DataTransferItemList (from paste/drop).
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
