import React, { useCallback } from "react";
import { cn } from "@/lib/utils";
import { TextareaInputProps } from "../types";

const TextareaInputComponent = ({
  input,
  onInputChange,
  onPaste,
  isRespondingToInterrupt,
}: TextareaInputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e.target.value);
    },
    [onInputChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    },
    [],
  );
  return (
    <textarea
      value={input}
      onChange={handleChange}
      onPaste={onPaste}
      onKeyDown={handleKeyDown}
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
};

TextareaInputComponent.displayName = "TextareaInput";

export const TextareaInput = React.memo(TextareaInputComponent);
