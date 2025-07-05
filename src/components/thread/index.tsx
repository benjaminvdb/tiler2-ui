import { cn } from "@/lib/utils";
import { useStreamContext } from "@/providers/stream";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useFileUpload } from "@/hooks/use-file-upload";

// Import our new components and hooks
import { useThreadState } from "./hooks/use-thread-state";
import { useThreadHandlers } from "./hooks/use-thread-handlers";
import { useThreadEffects } from "./hooks/use-thread-effects";
import { SidebarHistory } from "./layout/sidebar-history";
import { MainChatArea } from "./layout/main-chat-area";
import { ArtifactPanel } from "./layout/artifact-panel";

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

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SidebarHistory
        isOpen={chatHistoryOpen}
        isLargeScreen={isLargeScreen}
      />

      <div
        className={cn(
          "grid w-full grid-cols-[1fr_0fr] transition-all duration-500",
          artifactOpen && "grid-cols-[3fr_2fr]",
        )}
      >
        <MainChatArea
          chatStarted={chatStarted}
          chatHistoryOpen={chatHistoryOpen}
          isLargeScreen={isLargeScreen}
          onToggleChatHistory={() => setChatHistoryOpen((p) => !p)}
          onNewThread={() => setThreadId(null)}
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

        <ArtifactPanel onClose={closeArtifact} />
      </div>
    </div>
  );
}
