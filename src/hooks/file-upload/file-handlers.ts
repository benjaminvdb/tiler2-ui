import { ChangeEvent } from "react";
import { toast } from "sonner";
import type { Base64ContentBlock } from "@langchain/core/messages";
import { fileToContentBlock } from "@/lib/multimodal-utils";
import { validateFiles } from "./validation";
import { ERROR_MESSAGES } from "./constants";

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

    const fileArray = Array.from(files);
    const { invalidFiles, duplicateFiles, uniqueFiles } = validateFiles(
      fileArray,
      contentBlocks,
    );

    if (invalidFiles.length > 0) {
      toast.error(ERROR_MESSAGES.INVALID_FILE_TYPE);
    }
    if (duplicateFiles.length > 0) {
      toast.error(
        ERROR_MESSAGES.DUPLICATE_FILES(duplicateFiles.map((f) => f.name)),
      );
    }

    if (uniqueFiles.length > 0) {
      const newBlocks = await Promise.all(uniqueFiles.map(fileToContentBlock));
      setContentBlocks((prev) => [...prev, ...newBlocks]);
    }

    // Reset the input value to allow re-uploading the same file
    e.target.value = "";
  };

  const handlePaste = async (
    e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    const items = e.clipboardData.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length === 0) {
      return;
    }

    e.preventDefault();
    const { invalidFiles, duplicateFiles, uniqueFiles } = validateFiles(
      files,
      contentBlocks,
    );

    if (invalidFiles.length > 0) {
      toast.error(ERROR_MESSAGES.INVALID_PASTE_TYPE);
    }
    if (duplicateFiles.length > 0) {
      toast.error(
        ERROR_MESSAGES.DUPLICATE_FILES(duplicateFiles.map((f) => f.name)),
      );
    }
    if (uniqueFiles.length > 0) {
      const newBlocks = await Promise.all(uniqueFiles.map(fileToContentBlock));
      setContentBlocks((prev) => [...prev, ...newBlocks]);
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
