import React, { useEffect, useRef } from "react";
import { Send, Plus, Loader2 } from "lucide-react";
import { ContentBlocksPreview } from "../content-blocks-preview";
import { ToolCallsToggle } from "./components/tool-calls-toggle";
import { ChatInputProps } from "./types";
import { cn } from "@/shared/utils/utils";

/**
 * File upload button with hidden file input
 */
interface FileUploadButtonProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileUpload,
}) => {
  const handleClick = () => {
    const input = document.getElementById("file-input") as HTMLInputElement;
    input?.click();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="text-muted-foreground hover:bg-sand hover:text-foreground absolute bottom-2.5 left-2 flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200"
        aria-label="Attach file"
      >
        <Plus
          className="h-4 w-4"
          strokeWidth={2}
        />
      </button>
      <input
        id="file-input"
        type="file"
        onChange={onFileUpload}
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/csv"
        className="hidden"
      />
    </>
  );
};

/**
 * Auto-resizing textarea for chat input
 */
interface ChatTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

const ChatTextarea: React.FC<ChatTextareaProps> = ({
  value,
  onChange,
  onPaste,
  isLoading,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (value === "" && !isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [value, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      onPaste={onPaste}
      onKeyDown={handleKeyDown}
      placeholder="Ask anything about sustainability, climate action, and regenerative practices"
      disabled={isLoading}
      autoFocus
      rows={1}
      className="placeholder:text-muted-foreground field-sizing-content max-h-[200px] w-full resize-none overflow-y-auto bg-transparent py-3.5 pr-11 pl-11 text-sm leading-normal outline-none placeholder:opacity-40 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
};

/**
 * Submit/stop button for chat input
 */
interface SubmitButtonProps {
  isLoading: boolean;
  inputHasText: boolean;
  onStop?: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading,
  inputHasText,
  onStop,
}) => (
  <button
    type={isLoading ? "button" : "submit"}
    onClick={isLoading ? onStop : undefined}
    disabled={!inputHasText && !isLoading}
    className="absolute right-2 bottom-2.5 flex h-8 w-8 items-center justify-center rounded-md text-white transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    style={{
      backgroundColor: "var(--forest-green)",
      boxShadow:
        inputHasText || isLoading ? "0 2px 8px rgba(11, 61, 46, 0.15)" : "none",
    }}
  >
    {isLoading ? (
      <Loader2
        className="h-3.5 w-3.5 animate-spin"
        strokeWidth={2}
      />
    ) : (
      <Send
        className="h-3.5 w-3.5"
        strokeWidth={2}
      />
    )}
  </button>
);

const ChatInputComponent = ({
  input,
  onInputChange,
  onSubmit,
  onPaste,
  onFileUpload,
  contentBlocks,
  onRemoveBlock,
  isLoading,
  hideToolCalls,
  onHideToolCallsChange,
  onStop,
  dragOver,
  dropRef,
}: ChatInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
  };

  return (
    <div
      ref={dropRef}
      className="relative mx-auto w-full max-w-3xl"
    >
      <form
        onSubmit={onSubmit}
        className="w-full"
      >
        <ContentBlocksPreview
          blocks={contentBlocks}
          onRemove={onRemoveBlock}
        />

        <div
          className={cn(
            "bg-card focus-within:border-sage relative rounded-lg border transition-all duration-200 focus-within:shadow-sm",
            dragOver
              ? "border-primary border-2 border-dotted"
              : "border-border",
          )}
          style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}
        >
          <FileUploadButton onFileUpload={onFileUpload} />

          <ChatTextarea
            value={input}
            onChange={handleChange}
            onPaste={onPaste}
            isLoading={isLoading}
          />

          <SubmitButton
            isLoading={isLoading}
            inputHasText={!!input.trim()}
            onStop={onStop}
          />
        </div>

        <ToolCallsToggle
          hideToolCalls={hideToolCalls}
          onHideToolCallsChange={onHideToolCallsChange}
        />

        <p className="text-muted-foreground mt-2 mb-2 px-2 text-xs opacity-60">
          Press Enter to send, Shift + Enter for new line
        </p>
      </form>
    </div>
  );
};

ChatInputComponent.displayName = "ChatInput";

export const ChatInput = ChatInputComponent;
