import React, { createContext, useContext, ReactNode } from "react";
import type { ContentBlocks } from "@/shared/types";

export interface ChatContextType {
  chatStarted: boolean;
  firstTokenReceived: boolean;
  input: string;
  contentBlocks: ContentBlocks;
  hideToolCalls: boolean;
  dragOver: boolean;
  dropRef: React.RefObject<HTMLDivElement | null>;

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

// eslint-disable-next-line react-refresh/only-export-components
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
