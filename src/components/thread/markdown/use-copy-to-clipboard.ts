import { useState } from "react";

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
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return { isCopied, copyToClipboard };
};
