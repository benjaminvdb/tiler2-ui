import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useStreamContext } from "@/providers/Stream";
import { XIcon } from "lucide-react";
import { StickToBottom } from "use-stick-to-bottom";
import ThreadHistory from "./history";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
  ArtifactContent,
  ArtifactTitle,
} from "./artifact";
import { DO_NOT_RENDER_ID_PREFIX } from "@/lib/ensure-tool-responses";
import { AssistantMessage, AssistantMessageLoading } from "./messages/ai";
import { HumanMessage } from "./messages/human";
import { LinkLogoSVG } from "../icons/link";

// Import our new components and hooks
import { StickyToBottomContent, ScrollToBottom } from "./scroll-utils";
import { ActionButtons } from "./action-buttons";
import { ThreadHeader } from "./thread-header";
import { ChatInput } from "./chat-input";
import { useThreadState } from "./hooks/use-thread-state";
import { useThreadHandlers } from "./hooks/use-thread-handlers";
import { useThreadEffects } from "./hooks/use-thread-effects";

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
  const isLoading = stream.isLoading;

  // Use our custom hooks for handlers and effects
  const { handleSubmit, handleRegenerate, handleActionClick } = useThreadHandlers({
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
      <div className="relative hidden lg:flex">
        <motion.div
          className="absolute z-20 h-full overflow-hidden border-r bg-white"
          style={{ width: 300 }}
          animate={
            isLargeScreen
              ? { x: chatHistoryOpen ? 0 : -300 }
              : { x: chatHistoryOpen ? 0 : -300 }
          }
          initial={{ x: -300 }}
          transition={
            isLargeScreen
              ? { type: "spring", stiffness: 300, damping: 30 }
              : { duration: 0 }
          }
        >
          <div
            className="relative h-full"
            style={{ width: 300 }}
          >
            <ThreadHistory />
          </div>
        </motion.div>
      </div>

      <div
        className={cn(
          "grid w-full grid-cols-[1fr_0fr] transition-all duration-500",
          artifactOpen && "grid-cols-[3fr_2fr]",
        )}
      >
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
            onToggleChatHistory={() => setChatHistoryOpen((p) => !p)}
            onNewThread={() => setThreadId(null)}
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
                <>
                  {messages
                    .filter((m) => {
                      if (m.id?.startsWith(DO_NOT_RENDER_ID_PREFIX))
                        return false;
                      // Hide messages that contain the "hidden" tag
                      const tags = (m as any).tags;
                      if (Array.isArray(tags) && tags.includes("hidden"))
                        return false;
                      return true;
                    })
                    .map((message, index) =>
                      message.type === "human" ? (
                        <HumanMessage
                          key={`${message.id || uuidv4()}-${index}`}
                          message={message}
                          isLoading={isLoading}
                        />
                      ) : (
                        <AssistantMessage
                          key={`${message.id || uuidv4()}-${index}`}
                          message={message}
                          isLoading={isLoading}
                          handleRegenerate={handleRegenerate}
                        />
                      ),
                    )}
                  {!!stream.interrupt && (
                    <AssistantMessage
                      key="interrupt-msg"
                      message={undefined}
                      isLoading={isLoading}
                      handleRegenerate={handleRegenerate}
                    />
                  )}
                  {isLoading && !firstTokenReceived && (
                    <AssistantMessageLoading />
                  )}
                </>
              }
              footer={
                <div className="sticky bottom-0 flex flex-col items-center gap-8 bg-white">
                  {!chatStarted && (
                    <div className="flex items-center gap-3">
                      <LinkLogoSVG className="h-8 flex-shrink-0" />
                      <h1 className="text-2xl font-semibold tracking-tight">
                        Link Chat
                      </h1>
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
                    onInputChange={setInput}
                    onSubmit={handleSubmit}
                    onPaste={handlePaste}
                    onFileUpload={handleFileUpload}
                    contentBlocks={contentBlocks}
                    onRemoveBlock={removeBlock}
                    isLoading={isLoading}
                    isRespondingToInterrupt={isRespondingToInterrupt}
                    hideToolCalls={hideToolCalls}
                    onHideToolCallsChange={setHideToolCalls}
                    onStop={() => stream.stop()}
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
              }
            />
          </StickToBottom>
        </motion.div>
        <div className="relative flex flex-col border-l">
          <div className="absolute inset-0 flex min-w-[30vw] flex-col">
            <div className="grid grid-cols-[1fr_auto] border-b p-4">
              <ArtifactTitle className="truncate overflow-hidden" />
              <button
                onClick={closeArtifact}
                className="cursor-pointer"
              >
                <XIcon className="size-5" />
              </button>
            </div>
            <ArtifactContent className="relative flex-grow" />
          </div>
        </div>
      </div>
    </div>
  );
}
