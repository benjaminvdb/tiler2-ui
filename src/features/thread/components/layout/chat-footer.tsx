import React from "react";
import { ScrollToBottom } from "../scroll-utils";
import { ChatInput } from "../chat-input-components";
import { useStreamContext } from "@/core/providers/stream";
import { useChatContext } from "@/features/chat/providers/chat-provider";
import { cn } from "@/shared/utils/utils";

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
    hideToolCalls,
    onHideToolCallsChange,
    dragOver,
    dropRef,
  } = useChatContext();
  const stream = useStreamContext();
  const isLoading = stream.isLoading;

  const handleStop = () => {
    stream.stop();
  };

  return (
    <div
      className={cn(
        "bg-background sticky bottom-0 flex flex-col items-center gap-8",
        chatStarted ? "pb-4" : "pb-12",
      )}
    >
      <ScrollToBottom className="animate-in fade-in-0 zoom-in-95 absolute bottom-full left-1/2 mb-4 -translate-x-1/2" />
      <ChatInput
        input={input}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
        onPaste={onPaste}
        onFileUpload={onFileUpload}
        contentBlocks={contentBlocks}
        onRemoveBlock={onRemoveBlock}
        isLoading={isLoading}
        hideToolCalls={hideToolCalls}
        onHideToolCallsChange={onHideToolCallsChange}
        onStop={handleStop}
        dragOver={dragOver}
        dropRef={dropRef}
      />
    </div>
  );
};

ChatFooterComponent.displayName = "ChatFooter";

export const ChatFooter = ChatFooterComponent;
