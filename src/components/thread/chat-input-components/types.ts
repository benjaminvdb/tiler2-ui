import { FormEvent } from "react";
import type { ContentBlocks } from "@/types";

export interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contentBlocks: ContentBlocks;
  onRemoveBlock: (index: number) => void;
  isLoading: boolean;
  isRespondingToInterrupt: boolean;
  hideToolCalls: boolean;
  onHideToolCallsChange: (checked: boolean) => void;
  onStop: () => void;
  dragOver: boolean;
  dropRef: React.RefObject<HTMLDivElement | null>;
  chatStarted: boolean;
}

export interface ContainerProps {
  dragOver: boolean;
  chatStarted: boolean;
  dropRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}

export interface TextareaInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  isRespondingToInterrupt: boolean;
}

export interface InterruptIndicatorProps {
  isRespondingToInterrupt: boolean;
}

export interface ControlsSectionProps {
  hideToolCalls: boolean;
  onHideToolCallsChange: (checked: boolean) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  onStop: () => void;
  input: string;
  contentBlocks: ContentBlocks;
}

export interface ToolCallsToggleProps {
  hideToolCalls: boolean;
  onHideToolCallsChange: (checked: boolean) => void;
}

export interface FileUploadProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ActionButtonsProps {
  isLoading: boolean;
  onStop: () => void;
  input: string;
  contentBlocks: ContentBlocks;
}
