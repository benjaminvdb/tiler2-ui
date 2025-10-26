import React, { useCallback } from "react";
import { cn } from "@/shared/utils/utils";
import { TextareaInputProps } from "../types";
import { validateAndSanitizeInput } from "@/shared/utils/validation";

const TextareaInputComponent = ({
  input,
  onInputChange,
  onPaste,
  isRespondingToInterrupt,
}: TextareaInputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { isValid, sanitized } = validateAndSanitizeInput(e.target.value);
      if (isValid) {
        onInputChange(sanitized);
      }
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
        "field-sizing-content resize-none border-none bg-transparent p-3.5 pb-0 shadow-none ring-0 outline-none focus:ring-0 focus:outline-none placeholder:opacity-40",
      )}
      style={{
        fontSize: "15px",
        lineHeight: "1.5",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    />
  );
};

TextareaInputComponent.displayName = "TextareaInput";

export const TextareaInput = React.memo(TextareaInputComponent);
