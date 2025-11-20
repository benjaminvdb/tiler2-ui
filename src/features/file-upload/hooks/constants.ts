export const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/csv",
];

export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE:
    "You have uploaded invalid file type. Please upload a JPEG, PNG, GIF, WEBP image, PDF, or CSV file.",
  INVALID_PASTE_TYPE:
    "You have pasted an invalid file type. Please paste a JPEG, PNG, GIF, WEBP image, PDF, or CSV file.",
  DUPLICATE_FILES: (filenames: string[]) =>
    `Duplicate file(s) detected: ${filenames.join(", ")}. Each file can only be uploaded once per message.`,
} as const;
