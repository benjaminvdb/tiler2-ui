import { v4 as uuidv4 } from "uuid";
import { ReactNode, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useStreamContext } from "@/providers/Stream";
import { useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Checkpoint, Message } from "@langchain/langgraph-sdk";
import AuthButtons from "../AuthButtons";
import { AssistantMessage, AssistantMessageLoading } from "./messages/ai";
import { HumanMessage } from "./messages/human";
import {
  DO_NOT_RENDER_ID_PREFIX,
  ensureToolCallsHaveResponses,
} from "@/lib/ensure-tool-responses";
import { LinkLogoSVG } from "../icons/link";
import { TooltipIconButton } from "./tooltip-icon-button";
import {
  ArrowDown,
  LoaderCircle,
  PanelRightOpen,
  PanelRightClose,
  SquarePen,
  XIcon,
  Plus,
  MessageSquare,
  FileText,
  Lightbulb,
  Rocket,
  Search,
} from "lucide-react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import ThreadHistory from "./history";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useFileUpload } from "@/hooks/use-file-upload";
import { ContentBlocksPreview } from "./ContentBlocksPreview";
import {
  useArtifactOpen,
  ArtifactContent,
  ArtifactTitle,
  useArtifactContext,
} from "./artifact";

function StickyToBottomContent(props: {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();
  return (
    <div
      ref={context.scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={props.className}
    >
      <div
        ref={context.contentRef}
        className={props.contentClassName}
      >
        {props.content}
      </div>

      {props.footer}
    </div>
  );
}

function ScrollToBottom(props: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button
      variant="outline"
      className={props.className}
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="h-4 w-4" />
      <span>Scroll to bottom</span>
    </Button>
  );
}

export function Thread() {
  const [artifactContext, setArtifactContext] = useArtifactContext();
  const [artifactOpen, closeArtifact] = useArtifactOpen();

  const [threadId, _setThreadId] = useQueryState("threadId");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );
  const [hideToolCalls, setHideToolCalls] = useQueryState(
    "hideToolCalls",
    parseAsBoolean.withDefault(false),
  );
  const [input, setInput] = useState("");
  const {
    contentBlocks,
    setContentBlocks,
    handleFileUpload,
    dropRef,
    removeBlock,
    resetBlocks,
    dragOver,
    handlePaste,
  } = useFileUpload();
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const stream = useStreamContext();
  const messages = stream.messages;
  const isLoading = stream.isLoading;

  // Track interrupt state for chat-based responses
  const [isRespondingToInterrupt, setIsRespondingToInterrupt] = useState(false);
  const [currentInterrupt, setCurrentInterrupt] = useState<any>(null);

  const lastError = useRef<string | undefined>(undefined);

  const setThreadId = (id: string | null) => {
    _setThreadId(id);

    // close artifact and reset artifact context
    closeArtifact();
    setArtifactContext({});
  };

  useEffect(() => {
    if (!stream.error) {
      lastError.current = undefined;
      return;
    }
    try {
      const message = (stream.error as any).message;
      if (!message || lastError.current === message) {
        // Message has already been logged. do not modify ref, return early.
        return;
      }

      // Message is defined, and it has not been logged yet. Save it, and send the error
      lastError.current = message;
      toast.error("An error occurred. Please try again.", {
        description: (
          <p>
            <strong>Error:</strong> <code>{message}</code>
          </p>
        ),
        richColors: true,
        closeButton: true,
      });
    } catch {
      // no-op
    }
  }, [stream.error]);

  // TODO: this should be part of the useStream hook
  const prevMessageLength = useRef(0);
  useEffect(() => {
    if (
      messages.length !== prevMessageLength.current &&
      messages?.length &&
      messages[messages.length - 1].type === "ai"
    ) {
      setFirstTokenReceived(true);
    }

    prevMessageLength.current = messages.length;
  }, [messages]);

  // Check for active interrupts and update state
  useEffect(() => {
    if (stream.interrupt && !isRespondingToInterrupt) {
      // There's an active interrupt, set up response mode
      setCurrentInterrupt(stream.interrupt);
      setIsRespondingToInterrupt(true);
    } else if (!stream.interrupt && isRespondingToInterrupt) {
      // Interrupt was resolved, clear response mode
      setIsRespondingToInterrupt(false);
      setCurrentInterrupt(null);
    }
  }, [stream.interrupt, isRespondingToInterrupt]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((input.trim().length === 0 && contentBlocks.length === 0) || isLoading)
      return;
    setFirstTokenReceived(false);

    // Check if we're responding to an interrupt
    if (isRespondingToInterrupt && currentInterrupt) {
      // Handle interrupt response
      const response = {
        type: "response",
        args: input.trim(),
      };

      // Resume the stream with the interrupt response
      stream.submit(undefined, {
        command: {
          resume: response,
        },
      });

      // Clear interrupt state
      setIsRespondingToInterrupt(false);
      setCurrentInterrupt(null);
      setInput("");
      setContentBlocks([]);
      return;
    }

    // Normal message submission
    const newHumanMessage: Message = {
      id: uuidv4(),
      type: "human",
      content: [
        ...(input.trim().length > 0 ? [{ type: "text", text: input }] : []),
        ...contentBlocks,
      ] as Message["content"],
    };

    const toolMessages = ensureToolCallsHaveResponses(stream.messages);

    const context =
      Object.keys(artifactContext).length > 0 ? artifactContext : undefined;

    stream.submit(
      { messages: [...toolMessages, newHumanMessage], context },
      {
        streamMode: ["values"],
        optimisticValues: (prev) => ({
          ...prev,
          context,
          messages: [
            ...(prev.messages ?? []),
            ...toolMessages,
            newHumanMessage,
          ],
        }),
      },
    );

    setInput("");
    setContentBlocks([]);
  };

  const handleRegenerate = (
    parentCheckpoint: Checkpoint | null | undefined,
  ) => {
    // Do this so the loading state is correct
    prevMessageLength.current = prevMessageLength.current - 1;
    setFirstTokenReceived(false);
    stream.submit(undefined, {
      checkpoint: parentCheckpoint,
      streamMode: ["values"],
    });
  };

  const handleActionClick = (prompt: string) => {
    stream.submit({ messages: prompt });
  };

  const chatStarted = !!threadId || !!messages.length;
  const hasNoAIOrToolMessages = !messages.find(
    (m) => m.type === "ai" || m.type === "tool",
  );

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
          {!chatStarted && (
            <div className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-3 p-2 pl-4">
              <div>
                {(!chatHistoryOpen || !isLargeScreen) && (
                  <Button
                    className="hover:bg-gray-100"
                    variant="ghost"
                    onClick={() => setChatHistoryOpen((p) => !p)}
                  >
                    {chatHistoryOpen ? (
                      <PanelRightOpen className="size-5" />
                    ) : (
                      <PanelRightClose className="size-5" />
                    )}
                  </Button>
                )}
              </div>
              <div className="absolute top-2 right-4 flex items-center">
                <AuthButtons />
              </div>
            </div>
          )}
          {chatStarted && (
            <div className="relative z-10 flex items-center justify-between gap-3 p-2">
              <div className="relative flex items-center justify-start gap-2">
                <div className="absolute left-0 z-10">
                  {(!chatHistoryOpen || !isLargeScreen) && (
                    <Button
                      className="hover:bg-gray-100"
                      variant="ghost"
                      onClick={() => setChatHistoryOpen((p) => !p)}
                    >
                      {chatHistoryOpen ? (
                        <PanelRightOpen className="size-5" />
                      ) : (
                        <PanelRightClose className="size-5" />
                      )}
                    </Button>
                  )}
                </div>
                <motion.button
                  className="flex cursor-pointer items-center gap-2"
                  onClick={() => setThreadId(null)}
                  animate={{
                    marginLeft: !chatHistoryOpen ? 48 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <LinkLogoSVG
                    width={32}
                    height={32}
                  />
                  <span className="text-xl font-semibold tracking-tight">
                    Link Chat
                  </span>
                </motion.button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <AuthButtons />
                </div>
                <TooltipIconButton
                  size="lg"
                  className="p-4"
                  tooltip="New thread"
                  variant="ghost"
                  onClick={() => setThreadId(null)}
                >
                  <SquarePen className="size-5" />
                </TooltipIconButton>
              </div>

              <div className="from-background to-background/0 absolute inset-x-0 top-full h-5 bg-gradient-to-b" />
            </div>
          )}

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

                  {/* Mobile action buttons (shown on screens <640px) - placed above chat input */}
                  {!chatStarted && (
                    <div className="mx-auto mb-4 grid w-full max-w-3xl grid-cols-2 gap-4 sm:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() =>
                          handleActionClick("Show me what you can do.")
                        }
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
                          <Rocket className="h-3 w-3 text-blue-400" />
                        </div>
                        <span className="text-sm font-light">Get started</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() =>
                          handleActionClick("Help me summarize some data.")
                        }
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
                          <FileText className="h-3 w-3 text-orange-400" />
                        </div>
                        <span className="text-sm font-light">
                          Summarize data
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() =>
                          handleActionClick(
                            "What resources do you have access to?",
                          )
                        }
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
                          <Search className="h-3 w-3 text-purple-400" />
                        </div>
                        <span className="text-sm font-light">
                          Explore Resources
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() => handleActionClick("Give me some ideas.")}
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
                          <Lightbulb className="h-3 w-3 text-yellow-400" />
                        </div>
                        <span className="text-sm font-light">
                          Find Inspiration
                        </span>
                      </Button>
                    </div>
                  )}

                  <div
                    ref={dropRef}
                    className={cn(
                      "relative z-10 mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-xs transition-all",
                      dragOver
                        ? "border-primary border-2 border-dotted"
                        : "border border-solid",
                      chatStarted && "mb-8",
                    )}
                  >
                    <form
                      onSubmit={handleSubmit}
                      className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2"
                    >
                      <ContentBlocksPreview
                        blocks={contentBlocks}
                        onRemove={removeBlock}
                      />
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPaste={handlePaste}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            !e.metaKey &&
                            !e.nativeEvent.isComposing
                          ) {
                            e.preventDefault();
                            const el = e.target as HTMLElement | undefined;
                            const form = el?.closest("form");
                            form?.requestSubmit();
                          }
                        }}
                        placeholder={
                          isRespondingToInterrupt
                            ? "Type your response..."
                            : "Type your message..."
                        }
                        className={cn(
                          "field-sizing-content resize-none border-none bg-transparent p-3.5 pb-0 shadow-none ring-0 outline-none focus:ring-0 focus:outline-none",
                        )}
                      />

                      {/* Show interrupt response indicator */}
                      {isRespondingToInterrupt && (
                        <div className="mx-3.5 mb-2 flex items-center gap-2 text-xs text-blue-600">
                          <MessageSquare className="h-3 w-3" />
                          <span>Responding to the assistant's question</span>
                          {/* <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 px-1 text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              // Send ignore response to backend
                              stream.submit(undefined, {
                                command: { resume: { type: "ignore", args: null } },
                              });
                              setIsRespondingToInterrupt(false);
                              setCurrentInterrupt(null);
                            }}
                          >
                            Cancel
                          </Button> */}
                        </div>
                      )}
                      <div className="flex items-center gap-6 p-2 pt-4">
                        {process.env.NEXT_PUBLIC_HIDE_TOOL_CALLS ===
                          "false" && (
                          <div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="render-tool-calls"
                                checked={hideToolCalls ?? true}
                                onCheckedChange={setHideToolCalls}
                              />
                              <Label
                                htmlFor="render-tool-calls"
                                className="text-sm text-gray-600"
                              >
                                Hide Tool Calls
                              </Label>
                            </div>
                          </div>
                        )}
                        <Label
                          htmlFor="file-input"
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <Plus className="size-5 text-gray-600" />
                          <span className="text-sm text-gray-600">
                            Upload PDF or Image
                          </span>
                        </Label>
                        <input
                          id="file-input"
                          type="file"
                          onChange={handleFileUpload}
                          multiple
                          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                          className="hidden"
                        />
                        {stream.isLoading ? (
                          <Button
                            key="stop"
                            onClick={() => stream.stop()}
                            className="ml-auto !bg-[#3DAE86] shadow-md transition-all hover:!bg-[#0f6a5f]"
                          >
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Cancel
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            className="ml-auto !bg-[#3DAE86] shadow-md transition-all hover:!bg-[#0f6a5f]"
                            disabled={
                              isLoading ||
                              (!input.trim() && contentBlocks.length === 0)
                            }
                          >
                            Send
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Action buttons on white background, separated from chat input */}
                  {!chatStarted && (
                    <div className="mt-2 hidden items-center justify-center gap-4 pb-4 sm:flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() =>
                          handleActionClick("Show me what you can do.")
                        }
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
                          <Rocket className="h-3 w-3 text-blue-400" />
                        </div>
                        <span className="text-sm font-light">Get started</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() =>
                          handleActionClick("Help me summarize some data.")
                        }
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
                          <FileText className="h-3 w-3 text-orange-400" />
                        </div>
                        <span className="text-sm font-light">
                          Summarize data
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() =>
                          handleActionClick(
                            "What resources do you have access to?",
                          )
                        }
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
                          <Search className="h-3 w-3 text-purple-400" />
                        </div>
                        <span className="text-sm font-light">
                          Explore Resources
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() => handleActionClick("Give me some ideas.")}
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-transparent">
                          <Lightbulb className="h-3 w-3 text-yellow-400" />
                        </div>
                        <span className="text-sm font-light">
                          Find Inspiration
                        </span>
                      </Button>

                      {/* <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full px-3 py-2 border border-gray-200"
                    >
                      <span className="text-sm font-light">More</span>
                    </Button> */}
                    </div>
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
