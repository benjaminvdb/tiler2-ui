import type { MultimodalContentBlock } from "@/shared/types";
import { SUPPORTED_FILE_TYPES } from "./constants";
import { fileUploadSchema, validateInput } from "@/shared/utils/validation";

export const isDuplicate = (
  file: File,
  blocks: MultimodalContentBlock[],
): boolean => {
  if (file.type === "application/pdf") {
    return blocks.some(
      (b) =>
        b.type === "file" &&
        b.mimeType === "application/pdf" &&
        b.metadata?.filename === file.name,
    );
  }
  if (file.type === "text/csv") {
    return blocks.some(
      (b) =>
        b.type === "file" &&
        b.mimeType === "text/csv" &&
        b.metadata?.filename === file.name,
    );
  }
  if (SUPPORTED_FILE_TYPES.includes(file.type)) {
    return blocks.some(
      (b) =>
        b.type === "image" &&
        b.metadata?.name === file.name &&
        b.mimeType === file.type,
    );
  }
  return false;
};

export const validateFiles = (
  files: File[],
  contentBlocks: MultimodalContentBlock[],
) => {
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
