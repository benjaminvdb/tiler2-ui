import type { MultimodalContentBlock } from "@/shared/types";
import { toast } from "sonner";

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const SUPPORTED_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  "application/pdf",
  "text/csv",
] as const;
const BASE64_SEPARATOR = ",";

const isSupportedMimeType = (mime: string) =>
  SUPPORTED_MIME_TYPES.includes(mime as (typeof SUPPORTED_MIME_TYPES)[number]);

export const fileToContentBlock = async (
  file: File,
): Promise<MultimodalContentBlock> => {
  if (!isSupportedMimeType(file.type)) {
    const supportedList = SUPPORTED_MIME_TYPES.join(", ");
    const message = `Unsupported file type: ${file.type}. Supported types: ${supportedList}`;
    toast.error(message);
    throw new Error(message);
  }

  const data = await fileToBase64(file);

  if (
    IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])
  ) {
    return {
      type: "image",
      mimeType: file.type,
      mime_type: file.type, // Python backend expects snake_case
      data,
    } as MultimodalContentBlock;
  }

  return {
    type: "file",
    mimeType: file.type,
    mime_type: file.type,
    data,
    source_type: "base64",
    metadata: {
      filename: file.name,
      name: file.name,
    },
  } as MultimodalContentBlock;
};

export const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const [, base64] = result.split(BASE64_SEPARATOR);
      resolve(base64 ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const FILE_MIME_TYPES = ["application/pdf", "text/csv"];

export const isBase64ContentBlock = (
  block: unknown,
): block is MultimodalContentBlock => {
  if (typeof block !== "object" || block === null) {
    return false;
  }

  const candidate = block as Partial<MultimodalContentBlock>;
  const hasBase64Data = typeof candidate.data === "string";
  const mimeType = candidate.mimeType;

  if (
    candidate.type === "image" &&
    typeof mimeType === "string" &&
    hasBase64Data
  ) {
    return mimeType.startsWith("image/");
  }

  if (
    candidate.type === "file" &&
    typeof mimeType === "string" &&
    hasBase64Data
  ) {
    return FILE_MIME_TYPES.includes(mimeType);
  }

  return false;
};
