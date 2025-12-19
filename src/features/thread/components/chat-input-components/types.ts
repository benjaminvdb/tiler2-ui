import { FormEvent } from "react";
import type { ContentBlocks } from "@/shared/types";

export interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contentBlocks: ContentBlocks;
  onRemoveBlock: (index: number) => void;
  isLoading: boolean;
  hideToolCalls: boolean;
  onHideToolCallsChange: (checked: boolean) => void;
  onStop: () => void;
  dragOver: boolean;
  dropRef: React.RefObject<HTMLDivElement | null>;
}

export interface ToolCallsToggleProps {
  hideToolCalls: boolean;
  onHideToolCallsChange: (checked: boolean) => void;
}
