import type { UseCopilotChatReturn } from "@/core/providers/copilotkit";

/**
 * Creates a handler for action button clicks (e.g., workflow suggestions).
 * Uses CopilotKit's submit interface.
 */
export const createActionHandler = (chat: UseCopilotChatReturn) => {
  return (prompt: string) => {
    chat.submit({ content: prompt });
  };
};
