import type { MultimodalContentBlock } from "@/shared/types";
import { toast } from "sonner";

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const SUPPORTED_MIME_TYPES = [...IMAGE_MIME_TYPES, "application/pdf"] as const;
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

  if (IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) {
    return {
      type: "image",
      mimeType: file.type,
      data,
      metadata: { name: file.name },
    };
  }

  return {
    type: "file",
    mimeType: "application/pdf",
    data,
    metadata: { filename: file.name },
  };
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

export const isBase64ContentBlock = (
  block: unknown,
): block is MultimodalContentBlock => {
  if (typeof block !== "object" || block === null) {
    return false;
  }

  const candidate = block as Partial<MultimodalContentBlock>;
  const hasBase64Data = typeof candidate.data === "string";

  if (
    candidate.type === "image" &&
    typeof candidate.mimeType === "string" &&
    candidate.mimeType.startsWith("image/") &&
    hasBase64Data
  ) {
    return true;
  }

  if (
    candidate.type === "file" &&
    candidate.mimeType === "application/pdf" &&
    hasBase64Data
  ) {
    return true;
  }

  return false;
};
