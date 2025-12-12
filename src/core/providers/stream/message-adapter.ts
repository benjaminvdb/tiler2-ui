/**
 * Message Adapter for AG-UI Protocol
 *
 * Converts between AG-UI protocol messages and our UI message format.
 * This adapter enables seamless integration with existing UI components.
 */

import type { Message as AGUIMessage, ToolCall } from "@ag-ui/core";
import type { UIMessage, ContentBlock } from "./ag-ui-types";
import { v4 as uuidv4 } from "uuid";

const ROLE_TO_TYPE: Record<string, UIMessage["type"]> = {
  user: "human",
  assistant: "ai",
  tool: "tool",
  system: "ai",
  developer: "ai",
};

function parseMessageContent(content: unknown): string | ContentBlock[] {
  if (content === undefined || content === null) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content as unknown as ContentBlock[];
  return JSON.stringify(content);
}

/**
 * Convert an AG-UI message to our UI message format.
 */
export function aguiToUIMessage(message: AGUIMessage): UIMessage {
  const uiMessage: UIMessage = {
    id: message.id,
    type: ROLE_TO_TYPE[message.role] ?? "ai",
    content: parseMessageContent(message.content),
  };

  if (
    message.role === "assistant" &&
    "toolCalls" in message &&
    message.toolCalls
  ) {
    uiMessage.tool_calls = message.toolCalls;
  }

  if (message.role === "tool" && "toolCallId" in message) {
    uiMessage.tool_call_id = (message as { toolCallId: string }).toolCallId;
  }

  if ("name" in message && message.name) {
    uiMessage.name = message.name;
  }

  return uiMessage;
}

/**
 * Convert our UI message format to AG-UI message format.
 * Used when sending messages to the backend.
 */
export function uiToAGUIMessage(message: UIMessage): AGUIMessage {
  const typeToRole: Record<UIMessage["type"], string> = {
    human: "user",
    ai: "assistant",
    tool: "tool",
  };

  const role = typeToRole[message.type];

  // Convert content to string for AG-UI
  let content: string;
  if (typeof message.content === "string") {
    content = message.content;
  } else if (Array.isArray(message.content)) {
    // Extract text content from content blocks
    content = message.content
      .filter(
        (block): block is { type: "text"; text: string } =>
          block.type === "text",
      )
      .map((block) => block.text)
      .join("\n");
  } else {
    content = "";
  }

  // Build the appropriate message type based on role
  if (role === "user") {
    return {
      id: message.id,
      role: "user" as const,
      content,
    };
  }

  if (role === "assistant") {
    const assistantMessage: AGUIMessage = {
      id: message.id,
      role: "assistant" as const,
      content,
    };
    if (message.tool_calls && message.tool_calls.length > 0) {
      (assistantMessage as AGUIMessage & { toolCalls: ToolCall[] }).toolCalls =
        message.tool_calls;
    }
    return assistantMessage;
  }

  if (role === "tool") {
    return {
      id: message.id,
      role: "tool" as const,
      content,
      toolCallId: message.tool_call_id ?? "",
    };
  }

  // Default to user message
  return {
    id: message.id,
    role: "user" as const,
    content,
  };
}

/**
 * Create a placeholder AI message for streaming.
 */
export function createPlaceholderAIMessage(messageId?: string): UIMessage {
  return {
    id: messageId ?? uuidv4(),
    type: "ai",
    content: "",
  };
}
