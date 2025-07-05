import { FC } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { TooltipIconButton } from "@/components/thread/tooltip-icon-button";
import { useCopyToClipboard } from "./use-copy-to-clipboard";

interface CodeHeaderProps {
  language?: string;
  code: string;
}

export const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-t-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
      <span className="text-zinc-300">{language}</span>
      <TooltipIconButton
        tooltip={isCopied ? "Copied!" : "Copy code"}
        onClick={onCopy}
        className="h-4 w-4 text-zinc-300 hover:text-white"
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </TooltipIconButton>
    </div>
  );
};
