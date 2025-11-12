import type { MultimodalContentBlock } from "@/shared/types";
import { toast } from "sonner";

// Returns a Promise of a typed multimodal block for images or PDFs
export const fileToContentBlock = async (
  file: File,
): Promise<MultimodalContentBlock> => {
  const supportedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const supportedFileTypes = [...supportedImageTypes, "application/pdf"];

  if (!supportedFileTypes.includes(file.type)) {
    toast.error(
      `Unsupported file type: ${file.type}. Supported types are: ${supportedFileTypes.join(", ")}`,
    );
    return Promise.reject(new Error(`Unsupported file type: ${file.type}`));
  }

  const data = await fileToBase64(file);

  if (supportedImageTypes.includes(file.type)) {
    return {
      type: "image",
      mimeType: file.type,
      data,
      metadata: { name: file.name },
    } as const;
  }

  // PDF
  return {
    type: "file",
    mimeType: "application/pdf",
    data,
    metadata: { filename: file.name },
  } as const;
};

// Helper to convert File to base64 string
export const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data:...;base64, prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Type guard for MultimodalContentBlock
export const isBase64ContentBlock = (
  block: unknown,
): block is MultimodalContentBlock => {
  if (typeof block !== "object" || block === null || !("type" in block))
    return false;

  const typedBlock = block as {
    type: unknown;
    mimeType?: unknown;
    data?: unknown;
  };

  // Check for image type
  if (
    typedBlock.type === "image" &&
    "mimeType" in block &&
    typeof typedBlock.mimeType === "string" &&
    typedBlock.mimeType.startsWith("image/") &&
    "data" in block
  ) {
    return true;
  }

  // Check for file type (PDF)
  if (
    typedBlock.type === "file" &&
    "mimeType" in block &&
    typeof typedBlock.mimeType === "string" &&
    typedBlock.mimeType === "application/pdf" &&
    "data" in block
  ) {
    return true;
  }

  return false;
};
