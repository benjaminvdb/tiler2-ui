import React, { createContext, useContext, ReactNode } from "react";
import { Checkpoint } from "@langchain/langgraph-sdk";
import type { ContentBlocks } from "@/shared/types";

interface ChatContextType {
  // Chat state
  chatStarted: boolean;
  firstTokenReceived: boolean;
  input: string;
  contentBlocks: ContentBlocks;
  isRespondingToInterrupt: boolean;
  hideToolCalls: boolean;
  dragOver: boolean;
  dropRef: React.RefObject<HTMLDivElement | null>;

  // Actions
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPaste: (
    e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBlock: (idx: number) => void;
  onHideToolCallsChange: (value: boolean) => void;
  handleActionClick: (action: string) => void;
}
const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  value: ChatContextType;
}
export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  value,
}) => {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
