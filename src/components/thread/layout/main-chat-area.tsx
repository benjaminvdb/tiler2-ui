import React from "react";
import { motion } from "framer-motion";
import { Checkpoint } from "@langchain/langgraph-sdk";
import { cn } from "@/lib/utils";
import { StickToBottom } from "use-stick-to-bottom";
import { StickyToBottomContent } from "../scroll-utils";
import { ThreadHeader } from "../thread-header";
import { MessageList } from "./message-list";
import { ChatFooter } from "./chat-footer";

interface MainChatAreaProps {
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

export const MainChatArea: React.FC<MainChatAreaProps> = ({
  chatStarted,
  chatHistoryOpen,
  isLargeScreen,
  onToggleChatHistory,
  onNewThread,
  firstTokenReceived,
  handleRegenerate,
  input,
  onInputChange,
  onSubmit,
  onPaste,
  onFileUpload,
  contentBlocks,
  onRemoveBlock,
  isRespondingToInterrupt,
  hideToolCalls,
  onHideToolCallsChange,
  dragOver,
  dropRef,
  handleActionClick,
}) => {
  return (
    <motion.div
      className={cn(
        "relative flex min-w-0 flex-1 flex-col overflow-hidden",
        !chatStarted && "grid-rows-[1fr]",
      )}
      layout={isLargeScreen}
      animate={{
        marginLeft: chatHistoryOpen ? (isLargeScreen ? 300 : 0) : 0,
        width: chatHistoryOpen
          ? isLargeScreen
            ? "calc(100% - 300px)"
            : "100%"
          : "100%",
      }}
      transition={
        isLargeScreen
          ? { type: "spring", stiffness: 300, damping: 30 }
          : { duration: 0 }
      }
    >
      <ThreadHeader
        chatStarted={chatStarted}
        chatHistoryOpen={chatHistoryOpen}
        isLargeScreen={isLargeScreen}
        onToggleChatHistory={onToggleChatHistory}
        onNewThread={onNewThread}
      />

      <StickToBottom className="relative flex-1 overflow-hidden">
        <StickyToBottomContent
          className={cn(
            "absolute inset-0 overflow-y-scroll px-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent",
            !chatStarted && "mt-[25vh] flex flex-col items-stretch",
            chatStarted && "grid grid-rows-[1fr_auto]",
          )}
          contentClassName="pt-8 pb-16  max-w-3xl mx-auto flex flex-col gap-4 w-full"
          content={
            <MessageList
              firstTokenReceived={firstTokenReceived}
              handleRegenerate={handleRegenerate}
            />
          }
          footer={
            <ChatFooter
              chatStarted={chatStarted}
              input={input}
              onInputChange={onInputChange}
              onSubmit={onSubmit}
              onPaste={onPaste}
              onFileUpload={onFileUpload}
              contentBlocks={contentBlocks}
              onRemoveBlock={onRemoveBlock}
              isRespondingToInterrupt={isRespondingToInterrupt}
              hideToolCalls={hideToolCalls}
              onHideToolCallsChange={onHideToolCallsChange}
              dragOver={dragOver}
              dropRef={dropRef}
              handleActionClick={handleActionClick}
            />
          }
        />
      </StickToBottom>
    </motion.div>
  );
};