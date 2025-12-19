/**
 * Message Adapter for Vercel AI SDK UI
 *
 * Converts between Vercel AI UI messages and our UI message format.
 */

import type {
  UIDataTypes,
  UIMessage as VercelUIMessage,
  UIMessagePart,
  UITools,
} from "ai";
import type { UIMessage, ContentBlock, ToolCall } from "./stream-types";

const ROLE_TO_TYPE: Record<string, UIMessage["type"]> = {
  user: "human",
  assistant: "ai",
  system: "ai",
};

const TOOL_PREFIX = "tool-";
const DATA_URL_PATTERN = /^data:([^;]+);base64,(.*)$/;

type VercelUIMessagePart = UIMessagePart<UIDataTypes, UITools>;

const isToolPart = (part: VercelUIMessagePart): boolean =>
  part.type === "dynamic-tool" || part.type.startsWith(TOOL_PREFIX);

const isFilePart = (part: VercelUIMessagePart): boolean => part.type === "file";

const isTextPart = (part: VercelUIMessagePart): boolean =>
  part.type === "text" || part.type === "reasoning";

const getToolName = (part: VercelUIMessagePart): string => {
  if (part.type === "dynamic-tool") {
    return (part as { toolName?: string }).toolName ?? "unknown";
  }
  return part.type.slice(TOOL_PREFIX.length) || "unknown";
};

const parseDataUrl = (
  url: string,
): { mimeType: string; data: string } | null => {
  const match = url.match(DATA_URL_PATTERN);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
};

const serializeToolInput = (input: unknown): string => {
  if (input === undefined) {
    return "{}";
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input) as unknown;
      if (parsed && typeof parsed === "object") {
        return JSON.stringify(parsed);
      }
    } catch {
      // Fall through to wrap raw string input.
    }
    return JSON.stringify({ input });
  }

  try {
    return JSON.stringify(input);
  } catch {
    return "{}";
  }
};

const serializeToolOutput = (output: unknown): string => {
  if (output === undefined) return "";
  if (typeof output === "string") return output;
  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return String(output);
  }
};

const buildFileContentBlock = ({
  type,
  mimeType,
  data,
  url,
  metadata,
}: {
  type: "image" | "file";
  mimeType: string | undefined;
  data: string | undefined;
  url: string | undefined;
  metadata: { name?: string; filename?: string } | undefined;
}): Extract<ContentBlock, { type: "image" | "file" }> => {
  const contentBlock: Extract<ContentBlock, { type: "image" | "file" }> = {
    type,
  };

  if (mimeType) {
    contentBlock.mimeType = mimeType;
  }
  if (data) {
    contentBlock.data = data;
  }
  if (url) {
    contentBlock.url = url;
  }
  if (metadata) {
    contentBlock.metadata = metadata;
  }

  return contentBlock;
};

const filePartToContentBlock = (part: VercelUIMessagePart): ContentBlock => {
  const filePart = part as {
    mediaType?: string;
    url: string;
    filename?: string;
  };
  const parsed = parseDataUrl(filePart.url);
  const mimeType = filePart.mediaType || parsed?.mimeType;
  const isImage = Boolean(mimeType?.startsWith("image/"));
  const metadata = filePart.filename
    ? { filename: filePart.filename, name: filePart.filename }
    : undefined;
  const url = parsed ? undefined : filePart.url;
  const data = parsed?.data;
  const type = isImage ? "image" : "file";

  return buildFileContentBlock({ type, mimeType, data, url, metadata });
};

const buildContentFromParts = (
  parts: VercelUIMessagePart[],
): string | ContentBlock[] => {
  const blocks: ContentBlock[] = [];

  for (const part of parts) {
    if (isTextPart(part)) {
      blocks.push({ type: "text", text: (part as { text: string }).text });
      continue;
    }

    if (isFilePart(part)) {
      blocks.push(filePartToContentBlock(part));
    }
  }

  if (blocks.length === 0) return "";

  const hasNonText = blocks.some((block) => block.type !== "text");
  if (!hasNonText && blocks.length === 1 && blocks[0].type === "text") {
    return blocks[0].text;
  }

  return blocks;
};

const buildToolDataFromParts = (
  parts: VercelUIMessagePart[],
): { toolCalls: ToolCall[]; toolResults: UIMessage[] } => {
  const toolCallsById = new Map<string, ToolCall>();
  const toolResultsById = new Map<string, UIMessage>();

  for (const part of parts) {
    if (!isToolPart(part)) continue;

    const toolPart = part as {
      toolCallId: string;
      toolName?: string;
      input?: unknown;
      state?: string;
      output?: unknown;
      errorText?: string;
      approval?: { reason?: string; approved?: boolean };
    };

    const toolCallId = toolPart.toolCallId;
    if (!toolCallId) continue;

    const toolName = getToolName(part);
    toolCallsById.set(toolCallId, {
      id: toolCallId,
      type: "function",
      function: {
        name: toolName,
        arguments: serializeToolInput(toolPart.input),
      },
    });

    if (toolPart.state === "output-available") {
      toolResultsById.set(toolCallId, {
        id: `tool-result-${toolCallId}`,
        type: "tool",
        tool_call_id: toolCallId,
        name: toolName,
        content: serializeToolOutput(toolPart.output),
      });
    }

    if (toolPart.state === "output-error") {
      toolResultsById.set(toolCallId, {
        id: `tool-result-${toolCallId}`,
        type: "tool",
        tool_call_id: toolCallId,
        name: toolName,
        content: toolPart.errorText || "Tool execution failed.",
      });
    }

    if (toolPart.state === "output-denied") {
      toolResultsById.set(toolCallId, {
        id: `tool-result-${toolCallId}`,
        type: "tool",
        tool_call_id: toolCallId,
        name: toolName,
        content: toolPart.approval?.reason || "Tool execution denied.",
      });
    }
  }

  return {
    toolCalls: Array.from(toolCallsById.values()),
    toolResults: Array.from(toolResultsById.values()),
  };
};

/**
 * Convert a Vercel AI UI message to our UI message format.
 */
export function vercelToUIMessage(message: VercelUIMessage): {
  message: UIMessage;
  toolResults: UIMessage[];
} | null {
  if (message.role === "system") {
    return null;
  }

  const content = buildContentFromParts(message.parts || []);
  const { toolCalls, toolResults } = buildToolDataFromParts(
    message.parts || [],
  );

  const uiMessage: UIMessage = {
    id: message.id,
    type: ROLE_TO_TYPE[message.role] ?? "ai",
    content,
    ...(toolCalls.length > 0 ? { tool_calls: toolCalls } : {}),
  };

  return { message: uiMessage, toolResults };
}

export function vercelMessagesToUI(messages: VercelUIMessage[]): UIMessage[] {
  const uiMessages: UIMessage[] = [];

  for (const message of messages) {
    const converted = vercelToUIMessage(message);
    if (!converted) continue;
    uiMessages.push(converted.message, ...converted.toolResults);
  }

  return uiMessages;
}

const buildFileUrl = (mimeType: string | undefined, data?: string): string =>
  data ? `data:${mimeType || "application/octet-stream"};base64,${data}` : "";

const buildFilePart = ({
  url,
  mediaType,
  filename,
}: {
  url: string;
  mediaType: string;
  filename?: string;
}): VercelUIMessagePart => {
  const filePart: VercelUIMessagePart = { type: "file", url, mediaType };

  if (filename) {
    filePart.filename = filename;
  }

  return filePart;
};

const buildFilePartFromBlock = (
  block: Extract<ContentBlock, { type: "image" | "file" | "binary" }>,
  defaultMediaType: string,
): VercelUIMessagePart | null => {
  const url = block.url || buildFileUrl(block.mimeType, block.data);
  if (!url) return null;

  const filename = block.metadata?.filename ?? block.metadata?.name;
  const filePart: { url: string; mediaType: string; filename?: string } = {
    url,
    mediaType: block.mimeType || defaultMediaType,
  };

  if (filename) {
    filePart.filename = filename;
  }

  return buildFilePart(filePart);
};

const contentBlockToParts = (
  block: ContentBlock,
): VercelUIMessagePart | null => {
  switch (block.type) {
    case "text":
      return { type: "text", text: block.text };
    case "image":
      return buildFilePartFromBlock(block, "image/*");
    case "file":
    case "binary":
      return buildFilePartFromBlock(block, "application/octet-stream");
    case "image_url":
      return buildFilePart({
        url: block.image_url.url,
        mediaType: "image/*",
      });
    default:
      return null;
  }
};

const buildPartsFromContent = (
  content: UIMessage["content"],
): VercelUIMessagePart[] => {
  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }

  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .map((block) => contentBlockToParts(block))
    .filter((part): part is VercelUIMessagePart => part !== null);
};

/**
 * Convert our UI message format to a Vercel AI UI message.
 */
export function uiToVercelMessage(message: UIMessage): VercelUIMessage | null {
  const role =
    message.type === "human"
      ? "user"
      : message.type === "ai"
        ? "assistant"
        : null;

  if (!role) return null;

  return {
    id: message.id,
    role,
    parts: buildPartsFromContent(message.content),
  };
}
