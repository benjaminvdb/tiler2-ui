import { FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { ContentBlocksPreview } from "./ContentBlocksPreview";
import {
  LoaderCircle,
  Plus,
  MessageSquare,
} from "lucide-react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  contentBlocks: any[];
  onRemoveBlock: (index: number) => void;
  isLoading: boolean;
  isRespondingToInterrupt: boolean;
  hideToolCalls: boolean;
  onHideToolCallsChange: (checked: boolean) => void;
  onStop: () => void;
  dragOver: boolean;
  dropRef: React.RefObject<HTMLDivElement | null>;
  chatStarted: boolean;
}

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  onPaste,
  onFileUpload,
  contentBlocks,
  onRemoveBlock,
  isLoading,
  isRespondingToInterrupt,
  hideToolCalls,
  onHideToolCallsChange,
  onStop,
  dragOver,
  dropRef,
  chatStarted,
}: ChatInputProps) {
  return (
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
        onSubmit={onSubmit}
        className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2"
      >
        <ContentBlocksPreview
          blocks={contentBlocks}
          onRemove={onRemoveBlock}
        />
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onPaste={onPaste}
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
          </div>
        )}
        
        <div className="flex items-center gap-6 p-2 pt-4">
          {process.env.NEXT_PUBLIC_HIDE_TOOL_CALLS === "false" && (
            <div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="render-tool-calls"
                  checked={hideToolCalls ?? true}
                  onCheckedChange={onHideToolCallsChange}
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
            onChange={onFileUpload}
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
            className="hidden"
          />
          {isLoading ? (
            <Button
              key="stop"
              onClick={onStop}
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
  );
}