import type { Base64ContentBlock } from "@langchain/core/messages";
import { SUPPORTED_FILE_TYPES } from "./constants";
import { fileUploadSchema, validateInput } from "@/lib/validation";

export const isDuplicate = (
  file: File,
  blocks: Base64ContentBlock[],
): boolean => {
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

export const validateFiles = (
  files: File[],
  contentBlocks: Base64ContentBlock[],
) => {
  // First validate each file using Zod schema
  const schemaValidFiles: File[] = [];
  const schemaInvalidFiles: File[] = [];

  files.forEach((file) => {
    const validation = validateInput(fileUploadSchema, { file });
    if (validation.success) {
      schemaValidFiles.push(file);
    } else {
      schemaInvalidFiles.push(file);
    }
  });

  // Then check for duplicates and type support
  const typeValidFiles = schemaValidFiles.filter((file) =>
    SUPPORTED_FILE_TYPES.includes(file.type),
  );
  const typeInvalidFiles = [
    ...schemaInvalidFiles,
    ...schemaValidFiles.filter(
      (file) => !SUPPORTED_FILE_TYPES.includes(file.type),
    ),
  ];

  const duplicateFiles = typeValidFiles.filter((file) =>
    isDuplicate(file, contentBlocks),
  );
  const uniqueFiles = typeValidFiles.filter(
    (file) => !isDuplicate(file, contentBlocks),
  );

  return {
    validFiles: typeValidFiles,
    invalidFiles: typeInvalidFiles,
    duplicateFiles,
    uniqueFiles,
  };
};
