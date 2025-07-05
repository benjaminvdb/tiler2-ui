import React from "react";
import { Checkpoint } from "@langchain/langgraph-sdk";

export interface MainChatAreaProps {
  chatStarted: boolean;
  chatHistoryOpen: boolean;
  isLargeScreen: boolean;
  onToggleChatHistory: () => void;
  onNewThread: () => void;
  firstTokenReceived: boolean;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contentBlocks: any[];
  onRemoveBlock: (idx: number) => void;
  isRespondingToInterrupt: boolean;
  hideToolCalls: boolean;
  onHideToolCallsChange: (value: boolean) => void;
  dragOver: boolean;
  dropRef: React.RefObject<HTMLDivElement | null>;
  handleActionClick: (action: string) => void;
}