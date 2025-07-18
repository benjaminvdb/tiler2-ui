import React, { useMemo } from "react";
import { cn } from "@/shared/utils/utils";
import { useStreamContext } from "@/core/providers/stream";
import { useFileUpload } from "@/features/file-upload/hooks/use-file-upload";

// Import our new components and hooks
import { useThreadState } from "./hooks/use-thread-state";
import { useThreadHandlers } from "./hooks/use-thread-handlers";
import { useThreadEffects } from "./hooks/use-thread-effects";
import { MainChatArea } from "./layout/main-chat-area";
import { ArtifactPanel } from "./layout/artifact-panel";
import { ComponentErrorBoundary } from "@/shared/components/error-boundary";
import { ChatProvider } from "@/features/chat/providers/chat-provider";

export const Thread = (): React.JSX.Element => {
  // Use our custom hooks for state management
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
    lastError,
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

  // Use our custom hooks for handlers and effects
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
    lastError,
    prevMessageLength,
    setFirstTokenReceived,
    isRespondingToInterrupt,
    setIsRespondingToInterrupt,
    setCurrentInterrupt,
  });

  const chatStarted = !!threadId || !!messages.length;

  // Memoized computed values
  const memoizedChatStarted = useMemo(() => chatStarted, [chatStarted]);

  const chatContextValue = useMemo(
    () => ({
      chatStarted: memoizedChatStarted,
      firstTokenReceived,
      handleRegenerate,
      input,
      onInputChange: setInput,
      onSubmit: handleSubmit,
      onPaste: handlePaste,
      onFileUpload: handleFileUpload,
      contentBlocks,
      onRemoveBlock: removeBlock,
      isRespondingToInterrupt,
      hideToolCalls,
      onHideToolCallsChange: setHideToolCalls,
      dragOver,
      dropRef,
      handleActionClick,
    }),
    [
      memoizedChatStarted,
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
    ],
  );

  return (
    <ChatProvider value={chatContextValue}>
      <div
        className={cn(
          "grid h-screen w-full grid-cols-[1fr_0fr] transition-all duration-500",
          artifactOpen && "grid-cols-[3fr_2fr]",
        )}
      >
        <ComponentErrorBoundary>
          <MainChatArea />
        </ComponentErrorBoundary>

        <ComponentErrorBoundary>
          <ArtifactPanel onClose={closeArtifact} />
        </ComponentErrorBoundary>
      </div>
    </ChatProvider>
  );
};
