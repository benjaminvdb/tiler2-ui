import React from "react";
import { cn } from "@/shared/utils/utils";
import { useStreamContext } from "@/core/providers/stream";
import { useFileUpload } from "@/features/file-upload/hooks/use-file-upload";
import type { MultimodalContentBlock } from "@/shared/types";

import { useThreadState } from "./hooks/use-thread-state";
import { useThreadHandlers } from "./hooks/use-thread-handlers";
import { useThreadEffects } from "./hooks/use-thread-effects";
import { MainChatArea } from "./layout/main-chat-area";
import { ArtifactPanel } from "./layout/artifact-panel";
import { TaskThreadHeader } from "./task-thread-header";
import { ComponentErrorBoundary } from "@/shared/components/error-boundary";
import { ChatProvider } from "@/features/chat/providers/chat-provider";

/**
 * Custom hook to create chat context value
 */
function useChatContextValue(params: {
  chatStarted: boolean;
  firstTokenReceived: boolean;
  handleRegenerate: (
    parentCheckpoint:
      | import("@langchain/langgraph-sdk").Checkpoint
      | null
      | undefined,
  ) => void;
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handlePaste: (
    e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contentBlocks: MultimodalContentBlock[];
  removeBlock: (index: number) => void;
  isRespondingToInterrupt: boolean;
  hideToolCalls: boolean;
  setHideToolCalls: (hide: boolean) => void;
  dragOver: boolean;
  dropRef: React.RefObject<HTMLDivElement | null>;
  handleActionClick: (action: string) => void;
}) {
  return {
    chatStarted: params.chatStarted,
    firstTokenReceived: params.firstTokenReceived,
    handleRegenerate: params.handleRegenerate,
    input: params.input,
    onInputChange: params.setInput,
    onSubmit: params.handleSubmit,
    onPaste: params.handlePaste,
    onFileUpload: params.handleFileUpload,
    contentBlocks: params.contentBlocks,
    onRemoveBlock: params.removeBlock,
    isRespondingToInterrupt: params.isRespondingToInterrupt,
    hideToolCalls: params.hideToolCalls,
    onHideToolCallsChange: params.setHideToolCalls,
    dragOver: params.dragOver,
    dropRef: params.dropRef,
    handleActionClick: params.handleActionClick,
  };
}

export const Thread = (): React.JSX.Element => {
  const {
    artifactContext,
    artifactOpen,
    closeArtifact,
    threadId,
    hideToolCalls,
    setHideToolCalls,
    input,
    setInput,
    firstTokenReceived,
    setFirstTokenReceived,
    isRespondingToInterrupt,
    setIsRespondingToInterrupt,
    currentInterrupt,
    setCurrentInterrupt,
    lastErrorRef,
    prevMessageLength,
  } = useThreadState();

  const {
    contentBlocks,
    setContentBlocks,
    handleFileUpload,
    dropRef,
    removeBlock,
    dragOver,
    handlePaste,
  } = useFileUpload();

  const stream = useStreamContext();
  const messages = stream.messages;

  const { handleSubmit, handleRegenerate, handleActionClick } =
    useThreadHandlers({
      input,
      setInput,
      contentBlocks,
      setContentBlocks,
      isRespondingToInterrupt,
      setIsRespondingToInterrupt,
      currentInterrupt,
      setCurrentInterrupt,
      setFirstTokenReceived,
      artifactContext,
      prevMessageLength,
    });

  useThreadEffects({
    lastErrorRef,
    setFirstTokenReceived,
    isRespondingToInterrupt,
    setIsRespondingToInterrupt,
    setCurrentInterrupt,
  });

  const chatStarted = !!threadId || !!messages.length;

  const chatContextValue = useChatContextValue({
    chatStarted,
    firstTokenReceived,
    handleRegenerate,
    input,
    setInput,
    handleSubmit,
    handlePaste,
    handleFileUpload,
    contentBlocks,
    removeBlock,
    isRespondingToInterrupt,
    hideToolCalls,
    setHideToolCalls,
    dragOver,
    dropRef,
    handleActionClick,
  });

  return (
    <ChatProvider value={chatContextValue}>
      <div className="flex h-full w-full flex-col">
        <TaskThreadHeader />
        <div
          className={cn(
            "grid min-h-0 flex-1 transition-all duration-500",
            artifactOpen ? "grid-cols-[3fr_2fr]" : "grid-cols-[1fr]",
          )}
        >
          <ComponentErrorBoundary>
            <MainChatArea />
          </ComponentErrorBoundary>

          {artifactOpen && (
            <ComponentErrorBoundary>
              <ArtifactPanel onClose={closeArtifact} />
            </ComponentErrorBoundary>
          )}
        </div>
      </div>
    </ChatProvider>
  );
};
