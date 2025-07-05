import React from "react";
import { ThreadHeader } from "../thread-header";
import { MessageList } from "./message-list";
import { ChatFooter } from "./chat-footer";
import { MainChatAreaProps } from "./main-chat-area/types";
import { AnimatedContainer } from "./main-chat-area/components/animated-container";
import { ScrollableContent } from "./main-chat-area/components/scrollable-content";

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
  const messageListContent = (
    <MessageList
      firstTokenReceived={firstTokenReceived}
      handleRegenerate={handleRegenerate}
    />
  );

  const chatFooterContent = (
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
  );

  return (
    <AnimatedContainer
      chatStarted={chatStarted}
      chatHistoryOpen={chatHistoryOpen}
      isLargeScreen={isLargeScreen}
    >
      <ThreadHeader
        chatStarted={chatStarted}
        chatHistoryOpen={chatHistoryOpen}
        isLargeScreen={isLargeScreen}
        onToggleChatHistory={onToggleChatHistory}
        onNewThread={onNewThread}
      />

      <ScrollableContent
        chatStarted={chatStarted}
        content={messageListContent}
        footer={chatFooterContent}
      />
    </AnimatedContainer>
  );
};
