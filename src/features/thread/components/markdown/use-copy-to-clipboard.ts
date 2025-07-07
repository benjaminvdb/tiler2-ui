import { useState } from "react";
import { reportUiError } from "@/core/services/error-reporting";

interface UseCopyToClipboardOptions {
  copiedDuration?: number;
}

export const useCopyToClipboard = ({
  copiedDuration = 3000,
}: UseCopyToClipboardOptions = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = async (value: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    } catch (error) {
      reportUiError(error as Error, {
        operation: "copyToClipboard",
        component: "useCopyToClipboard",
      });
    }
  };

  return { isCopied, copyToClipboard };
};
