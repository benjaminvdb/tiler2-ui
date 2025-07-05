import { cn } from "@/lib/utils";
import { TextareaInputProps } from "../types";

export function TextareaInput({ 
  input, 
  onInputChange, 
  onPaste, 
  isRespondingToInterrupt 
}: TextareaInputProps) {
  return (
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
  );
}