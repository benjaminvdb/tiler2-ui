import { reportUiError } from "@/core/services/observability";

export interface CopyWithFormatOptions {
  markdownText: string;
  htmlContainerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Copies text to clipboard with both markdown (plain text) and HTML formats.
 * Provides rich text support for pasting into editors while maintaining plain text fallback.
 */
export const copyWithFormat = async ({
  markdownText,
  htmlContainerRef,
}: CopyWithFormatOptions): Promise<boolean> => {
  try {
    // If HTML container is provided and clipboard.write is supported, use multi-format copy
    if (
      htmlContainerRef?.current &&
      navigator.clipboard?.write &&
      typeof ClipboardItem !== "undefined"
    ) {
      const htmlContent = htmlContainerRef.current.innerHTML;
      const clipboardItem = new ClipboardItem({
        "text/html": new Blob([htmlContent], { type: "text/html" }),
        "text/plain": new Blob([markdownText], { type: "text/plain" }),
      });
      await navigator.clipboard.write([clipboardItem]);
      return true;
    }

    // Fallback to plain text copy
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(markdownText);
      return true;
    }

    // Legacy fallback using textarea
    const textarea = document.createElement("textarea");
    textarea.value = markdownText;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    reportUiError(error as Error, {
      operation: "copyWithFormat",
      component: "clipboard-utils",
    });
    return false;
  }
};
