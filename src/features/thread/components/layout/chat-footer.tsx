import React, { useCallback } from "react";
import { LinkLogoSVG } from "@/shared/components/icons/link";
import { ScrollToBottom } from "../scroll-utils";
import { ActionButtons } from "../action-buttons";
import { ChatInput } from "../chat-input-components";
import { useStreamContext } from "@/core/providers/stream";
import { useChatContext } from "@/features/chat/providers/chat-provider";

const ChatFooterComponent: React.FC = () => {
  const {
    chatStarted,
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
  } = useChatContext();
  const stream = useStreamContext();
  const isLoading = stream.isLoading;

  const handleStop = useCallback(() => {
    stream.stop();
  }, [stream]);

  return (
    <div className="sticky bottom-0 flex flex-col items-center gap-8 bg-white">
      {!chatStarted && (
        <div className="flex items-center gap-3">
          <LinkLogoSVG className="h-8 flex-shrink-0" />
          <h1 className="text-2xl font-semibold tracking-tight">Link Chat</h1>
        </div>
      )}
      <ScrollToBottom className="animate-in fade-in-0 zoom-in-95 absolute bottom-full left-1/2 mb-4 -translate-x-1/2" />
      {/* Mobile action buttons */}
      {!chatStarted && (
        <ActionButtons
          onActionClick={handleActionClick}
          isMobile={true}
        />
      )}
      <ChatInput
        input={input}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        onPaste={onPaste}
        onFileUpload={onFileUpload}
        contentBlocks={contentBlocks}
        onRemoveBlock={onRemoveBlock}
        isLoading={isLoading}
        isRespondingToInterrupt={isRespondingToInterrupt}
        hideToolCalls={hideToolCalls}
        onHideToolCallsChange={onHideToolCallsChange}
        onStop={handleStop}
        dragOver={dragOver}
        dropRef={dropRef}
        chatStarted={chatStarted}
      />
      {/* Desktop action buttons */}
      {!chatStarted && (
        <ActionButtons
          onActionClick={handleActionClick}
          isMobile={false}
        />
      )}
    </div>
  );
};

ChatFooterComponent.displayName = "ChatFooter";

export const ChatFooter = React.memo(ChatFooterComponent);
