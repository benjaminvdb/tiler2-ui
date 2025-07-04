import type { Base64ContentBlock } from "@langchain/core/messages";
import { SUPPORTED_FILE_TYPES } from "./constants";

export const isDuplicate = (file: File, blocks: Base64ContentBlock[]): boolean => {
  if (file.type === "application/pdf") {
    return blocks.some(
      (b) =>
        b.type === "file" &&
        b.mime_type === "application/pdf" &&
        b.metadata?.filename === file.name,
    );
  }
  if (SUPPORTED_FILE_TYPES.includes(file.type)) {
    return blocks.some(
      (b) =>
        b.type === "image" &&
        b.metadata?.name === file.name &&
        b.mime_type === file.type,
    );
  }
  return false;
};

export const validateFiles = (files: File[], contentBlocks: Base64ContentBlock[]) => {
  const validFiles = files.filter((file) =>
    SUPPORTED_FILE_TYPES.includes(file.type),
  );
  const invalidFiles = files.filter(
    (file) => !SUPPORTED_FILE_TYPES.includes(file.type),
  );
  const duplicateFiles = validFiles.filter((file) =>
    isDuplicate(file, contentBlocks),
  );
  const uniqueFiles = validFiles.filter(
    (file) => !isDuplicate(file, contentBlocks),
  );

  return {
    validFiles,
    invalidFiles,
    duplicateFiles,
    uniqueFiles,
  };
};