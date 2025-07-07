import React, { useCallback, useMemo } from "react";
import { cn } from "@/shared/utils/utils";
import { useStreamContext } from "@/core/providers/stream";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useFileUpload } from "@/features/file-upload/hooks/use-file-upload";

// Import our new components and hooks
import { useThreadState } from "./hooks/use-thread-state";
import { useThreadHandlers } from "./hooks/use-thread-handlers";
import { useThreadEffects } from "./hooks/use-thread-effects";
import { SidebarHistory } from "./layout/sidebar-history";
import { MainChatArea } from "./layout/main-chat-area";
import { ArtifactPanel } from "./layout/artifact-panel";
import { ComponentErrorBoundary } from "@/shared/components/error-boundary";
import { ChatProvider } from "@/features/chat/providers/chat-provider";
import { UIProvider } from "@/features/chat/providers/ui-provider";

export const Thread = (): React.JSX.Element => {
  // Use our custom hooks for state management
  const {
    artifactContext,
    artifactOpen,
    closeArtifact,
    threadId,
    setThreadId,
    chatHistoryOpen,
    setChatHistoryOpen,
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

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
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

  // Memoized callback functions to prevent unnecessary rerenders
  const handleToggleChatHistory = useCallback(() => {
    setChatHistoryOpen(!chatHistoryOpen);
  }, [chatHistoryOpen, setChatHistoryOpen]); // setChatHistoryOpen is stable from useQueryState

  const handleNewThread = useCallback(() => {
    setThreadId(null);
  }, [setThreadId]); // setThreadId is stable from useState

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

  const uiContextValue = useMemo(
    () => ({
      chatHistoryOpen,
      isLargeScreen,
      onToggleChatHistory: handleToggleChatHistory,
      onNewThread: handleNewThread,
    }),
    [chatHistoryOpen, isLargeScreen, handleToggleChatHistory, handleNewThread],
  );

  return (
    <UIProvider value={uiContextValue}>
      <ChatProvider value={chatContextValue}>
        <div className="flex h-screen w-full overflow-hidden">
          <ComponentErrorBoundary>
            <SidebarHistory />
          </ComponentErrorBoundary>

          <div
            className={cn(
              "grid w-full grid-cols-[1fr_0fr] transition-all duration-500",
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
        </div>
      </ChatProvider>
    </UIProvider>
  );
};
