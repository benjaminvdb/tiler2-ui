import { cn } from "@/lib/utils";
import { useStreamContext } from "@/providers/stream";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useCallback, useMemo } from "react";

// Import our new components and hooks
import { useThreadState } from "./hooks/use-thread-state";
import { useThreadHandlers } from "./hooks/use-thread-handlers";
import { useThreadEffects } from "./hooks/use-thread-effects";
import { SidebarHistory } from "./layout/sidebar-history";
import { MainChatArea } from "./layout/main-chat-area";
import { ArtifactPanel } from "./layout/artifact-panel";
import { ComponentErrorBoundary } from "@/components/error-boundary";

export function Thread() {
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
    setChatHistoryOpen((p) => !p);
  }, [setChatHistoryOpen]);

  const handleNewThread = useCallback(() => {
    setThreadId(null);
  }, [setThreadId]);

  // Memoized computed values
  const memoizedChatStarted = useMemo(() => chatStarted, [chatStarted]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ComponentErrorBoundary>
        <SidebarHistory
          isOpen={chatHistoryOpen}
          isLargeScreen={isLargeScreen}
        />
      </ComponentErrorBoundary>

      <div
        className={cn(
          "grid w-full grid-cols-[1fr_0fr] transition-all duration-500",
          artifactOpen && "grid-cols-[3fr_2fr]",
        )}
      >
        <ComponentErrorBoundary>
          <MainChatArea
            chatStarted={memoizedChatStarted}
            chatHistoryOpen={chatHistoryOpen}
            isLargeScreen={isLargeScreen}
            onToggleChatHistory={handleToggleChatHistory}
            onNewThread={handleNewThread}
            firstTokenReceived={firstTokenReceived}
            handleRegenerate={handleRegenerate}
            input={input}
            onInputChange={setInput}
            onSubmit={handleSubmit}
            onPaste={handlePaste}
            onFileUpload={handleFileUpload}
            contentBlocks={contentBlocks}
            onRemoveBlock={removeBlock}
            isRespondingToInterrupt={isRespondingToInterrupt}
            hideToolCalls={hideToolCalls}
            onHideToolCallsChange={setHideToolCalls}
            dragOver={dragOver}
            dropRef={dropRef}
            handleActionClick={handleActionClick}
          />
        </ComponentErrorBoundary>

        <ComponentErrorBoundary>
          <ArtifactPanel onClose={closeArtifact} />
        </ComponentErrorBoundary>
      </div>
    </div>
  );
}
