import { useCallback, useMemo, useState } from "react";
import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantApi,
  useAssistantState,
} from "@assistant-ui/react";
import { LandingPage } from "@/features/chat/components/landing-page";
import { Send, Plus, Loader2 } from "lucide-react";
import { StickToBottom } from "use-stick-to-bottom";
import { StickyToBottomContent } from "@/features/thread/components/scroll-utils";
import {
  CONTENT_CONTAINER_CLASS,
  getContentClassName,
} from "@/features/thread/components/layout/main-chat-area/utils/layout-styles";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { CommandBar } from "@/features/thread/components/messages/shared/components/command-bar";
import { ExpertHelpDialog } from "@/features/thread/components/messages/shared/components/expert-help-dialog";

const UserMessage = () => (
  <MessagePrimitive.Root className="mb-4 flex justify-end">
    <div className="bg-muted ring-border/60 max-w-3xl rounded-md px-3 py-2 text-sm shadow-sm ring-1">
      <MessagePrimitive.Attachments components={{}} />
      <MessagePrimitive.Parts />
    </div>
  </MessagePrimitive.Root>
);

const AssistantMessage = () => {
  const messageRole = useAssistantState(({ message }) => message.role);
  const threadRemoteId = useAssistantState(
    ({ threadListItem }) => threadListItem.remoteId,
  );
  const isThreadRunning = useAssistantState(({ thread }) => thread.isRunning);
  const [isExpertHelpOpen, setIsExpertHelpOpen] = useState(false);

  const api = useAssistantApi();
  const messageApi = api.message;

  const handleRegenerate = useCallback(() => {
    try {
      messageApi().reload();
    } catch (err) {
      console.error("Failed to regenerate message", err);
    }
  }, [messageApi]);

  const copyText = useMemo(() => {
    try {
      return messageApi().getCopyText();
    } catch {
      return "";
    }
  }, [messageApi]);

  const handleExpertHelpClick = useCallback(() => {
    setIsExpertHelpOpen(true);
  }, []);

  return (
    <MessagePrimitive.Root className="group mb-4 flex justify-start">
      <div className="bg-background ring-border/60 max-w-3xl rounded-md px-3 py-2 text-sm shadow-sm ring-1">
        <MessagePrimitive.Attachments components={{}} />
        <MessagePrimitive.Parts />

        {messageRole === "assistant" && copyText && (
          <div className="mt-2 mr-auto flex items-center gap-2 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100">
            <CommandBar
              content={copyText}
              isAiMessage
              isLoading={isThreadRunning}
              handleRegenerate={handleRegenerate}
              onExpertHelpClick={handleExpertHelpClick}
              threadId={threadRemoteId ?? null}
              runId={null}
            />
          </div>
        )}
      </div>

      <ExpertHelpDialog
        open={isExpertHelpOpen}
        onOpenChange={setIsExpertHelpOpen}
        threadId={threadRemoteId ?? null}
        runId={null}
        aiMessageContent={copyText}
      />
    </MessagePrimitive.Root>
  );
};

type ComposerProps = {
  isRunning: boolean;
};

const Composer = ({ isRunning }: ComposerProps) => (
  <ComposerPrimitive.Root className="w-full">
    <div className="relative mx-auto w-full max-w-3xl">
      <ComposerPrimitive.Attachments components={{}} />
      <div
        className="bg-card focus-within:border-sage relative rounded-lg border transition-all duration-200 focus-within:shadow-sm"
        style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}
      >
        <ComposerPrimitive.Input
          placeholder="Ask anything about sustainability, climate action, and regenerative practices"
          className="placeholder:text-muted-foreground field-sizing-content max-h-[200px] w-full resize-none overflow-y-auto bg-transparent py-3.5 pr-11 pl-11 text-sm leading-normal outline-none placeholder:opacity-40"
        />
        <ComposerPrimitive.AddAttachment className="text-muted-foreground hover:bg-sand hover:text-foreground absolute bottom-2.5 left-2 flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200">
          <Plus
            className="h-4 w-4"
            strokeWidth={2}
          />
        </ComposerPrimitive.AddAttachment>
        {isRunning ? (
          <ComposerPrimitive.Cancel className="bg-muted text-foreground absolute right-2 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200">
            <Loader2
              className="h-3.5 w-3.5 animate-spin"
              strokeWidth={2}
            />
          </ComposerPrimitive.Cancel>
        ) : (
          <ComposerPrimitive.Send
            className="absolute right-2 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-md text-white transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              backgroundColor: "var(--forest-green)",
              boxShadow: "0 2px 8px rgba(11, 61, 46, 0.15)",
            }}
          >
            <Send
              className="h-3.5 w-3.5"
              strokeWidth={2}
            />
          </ComposerPrimitive.Send>
        )}
      </div>
      <p className="text-muted-foreground mt-2 px-2 text-left text-xs opacity-60">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  </ComposerPrimitive.Root>
);

export const AssistantThread = () => {
  const api = useAssistantApi();
  const messages = useAssistantState(({ thread }) => thread.messages);
  const isRunning = useAssistantState(({ thread }) => thread.isRunning);
  const isLoading = useAssistantState(({ thread }) => thread.isLoading);

  const hasMessages = messages.length > 0;

  const handleSuggestionClick = useCallback(
    (text: string) => {
      const thread = api.thread();
      thread.composer.setText(text);
      thread.composer.send();
    },
    [api],
  );

  const handleCategoryClick = useCallback(
    (category: string) => {
      const thread = api.thread();
      thread.composer.setText(
        `I'd like to explore workflows in category: ${category}`,
      );
      thread.composer.send();
    },
    [api],
  );

  const content = (
    <ThreadPrimitive.Viewport className="flex flex-col gap-4">
      {hasMessages ? (
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
      ) : isLoading || isRunning ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center">
          <LandingPage
            onSuggestionClick={handleSuggestionClick}
            onWorkflowCategoryClick={handleCategoryClick}
          />
        </div>
      )}
    </ThreadPrimitive.Viewport>
  );

  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <StickToBottom className="relative flex-1 overflow-hidden">
          <StickyToBottomContent
            className={getContentClassName()}
            contentClassName={CONTENT_CONTAINER_CLASS}
            content={content}
            footer={
              <div className="bg-background sticky bottom-0 flex flex-col items-center gap-6 pt-4 pb-10">
                <Composer isRunning={isRunning} />
              </div>
            }
          />
        </StickToBottom>
      </div>
    </ThreadPrimitive.Root>
  );
};
