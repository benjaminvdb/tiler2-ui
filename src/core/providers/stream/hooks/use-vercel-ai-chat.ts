/**
 * Vercel AI SDK Chat Hook - Streaming interface for Vercel AI UI messages
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { useChat, type UseChatOptions } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  type ChatRequestOptions,
  type CreateUIMessage,
  type FileUIPart,
  type TextUIPart,
  type UIMessage,
  generateId,
} from "ai";
import type { StreamContextType } from "../stream-types";
import { reportStreamError } from "@/core/services/observability";

interface UseVercelAIChatConfig {
  apiUrl: string;
  assistantId: string;
  threadId: string | null;
  accessToken: string | null;
  onThreadId?: (id: string) => void;
}

const MAX_THREAD_NAME_LENGTH = 50;

type SendMessageInput = Parameters<
  ReturnType<typeof useChat<UIMessage>>["sendMessage"]
>[0];

type PendingSend = {
  message?: SendMessageInput;
  options?: ChatRequestOptions;
  messageId?: string;
  optimisticMessage?: UIMessage;
};

const getTextFromParts = (parts: UIMessage["parts"]): string => {
  return parts
    .filter((part) => part.type === "text" || part.type === "reasoning")
    .map((part) => ("text" in part ? part.text : ""))
    .join(" ")
    .trim();
};

const getThreadNameFromMetadata = (metadata: unknown): string | undefined => {
  if (!metadata || typeof metadata !== "object") return undefined;
  const name = (metadata as { name?: unknown }).name;
  if (typeof name !== "string") return undefined;
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, MAX_THREAD_NAME_LENGTH) : undefined;
};

const getThreadNameFromMessage = (
  message?: SendMessageInput,
): string | undefined => {
  if (!message || typeof message !== "object") return undefined;
  if ("text" in message && typeof message.text === "string") {
    return message.text.trim().slice(0, MAX_THREAD_NAME_LENGTH) || undefined;
  }
  if ("parts" in message && Array.isArray(message.parts)) {
    const text = getTextFromParts(message.parts as UIMessage["parts"]);
    return text ? text.slice(0, MAX_THREAD_NAME_LENGTH) : undefined;
  }
  return undefined;
};

const getThreadName = (
  message?: SendMessageInput,
  options?: ChatRequestOptions,
): string | undefined => {
  const metadataName = getThreadNameFromMetadata(options?.metadata);
  if (metadataName) return metadataName;
  return getThreadNameFromMessage(message);
};

const resolveMessageId = (message?: SendMessageInput): string | undefined => {
  if (!message || typeof message !== "object") return undefined;
  if ("messageId" in message && typeof message.messageId === "string") {
    return message.messageId;
  }
  if ("id" in message && typeof message.id === "string") {
    return message.id;
  }
  return generateId();
};

const withMessageId = (
  message: SendMessageInput,
  messageId: string,
): SendMessageInput => {
  if (!message || typeof message !== "object") return message;
  if ("messageId" in message && message.messageId === messageId) return message;
  return { ...message, messageId };
};

const resolveFileParts = (files?: FileList | FileUIPart[]): FileUIPart[] => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  return [];
};

type TextOrFileMessage = {
  text?: string;
  files?: FileList | FileUIPart[];
  metadata?: UIMessage["metadata"];
  messageId?: string;
};

const isCreateUIMessage = (
  message: SendMessageInput,
): message is CreateUIMessage<UIMessage> =>
  !!message &&
  typeof message === "object" &&
  "parts" in message &&
  Array.isArray(message.parts);

const isTextOrFileMessage = (
  message: SendMessageInput,
): message is TextOrFileMessage =>
  !!message &&
  typeof message === "object" &&
  ("text" in message || "files" in message);

const createTextPart = (text: string): TextUIPart => ({
  type: "text",
  text,
});

const getMessageText = (message: SendMessageInput): string => {
  if (!isTextOrFileMessage(message)) return "";
  return typeof message.text === "string" ? message.text : "";
};

const getMessageMetadata = (
  message: SendMessageInput,
): UIMessage["metadata"] | undefined => {
  if (!isTextOrFileMessage(message)) return undefined;
  return message.metadata;
};

const buildMessageFromParts = (
  message: SendMessageInput,
  messageId: string,
): UIMessage | null => {
  if (!isCreateUIMessage(message)) return null;

  return {
    ...message,
    id: messageId,
    role: message.role ?? "user",
  };
};

const buildMessageFromTextAndFiles = (
  message: SendMessageInput,
  messageId: string,
): UIMessage | null => {
  if (!isTextOrFileMessage(message)) return null;

  const fileParts = resolveFileParts(message.files);
  const text = getMessageText(message);
  const parts: UIMessage["parts"] = [
    ...fileParts,
    ...(text ? [createTextPart(text)] : []),
  ];

  if (parts.length === 0) return null;

  const metadata = getMessageMetadata(message);

  return {
    id: messageId,
    role: "user",
    parts,
    ...(metadata ? { metadata } : {}),
  };
};

const buildOptimisticMessage = (
  message: SendMessageInput,
  messageId: string,
): UIMessage | null =>
  buildMessageFromParts(message, messageId) ??
  buildMessageFromTextAndFiles(message, messageId);

const appendOptimisticMessage = (
  setChatMessages: ReturnType<typeof useChat<UIMessage>>["setMessages"],
  optimisticMessage: UIMessage | undefined | null,
) => {
  if (!optimisticMessage) return;
  setChatMessages((prev) => {
    if (prev.some((message) => message.id === optimisticMessage.id)) {
      return prev;
    }
    return [...prev, optimisticMessage];
  });
};

const buildPendingSend = ({
  message,
  options,
  messageId,
  optimisticMessage,
}: {
  message: SendMessageInput | undefined;
  options: ChatRequestOptions | undefined;
  messageId: string | undefined;
  optimisticMessage: UIMessage | null;
}): PendingSend => {
  const pending: PendingSend = { message };

  if (options) {
    pending.options = options;
  }

  if (messageId && optimisticMessage) {
    pending.messageId = messageId;
    pending.optimisticMessage = optimisticMessage;
  }

  return pending;
};

const queuePendingSend = ({
  message,
  options,
  pendingSendRef,
  skipThreadLoadRef,
  createThread,
  setChatMessages,
}: {
  message: SendMessageInput | undefined;
  options: ChatRequestOptions | undefined;
  pendingSendRef: MutableRefObject<PendingSend | null>;
  skipThreadLoadRef: MutableRefObject<boolean>;
  createThread: (name: string | undefined) => Promise<string | null>;
  setChatMessages: ReturnType<typeof useChat<UIMessage>>["setMessages"];
}) => {
  skipThreadLoadRef.current = true;
  const messageId = resolveMessageId(message);
  const optimisticMessage =
    message && messageId ? buildOptimisticMessage(message, messageId) : null;
  const messageWithId =
    message && messageId && optimisticMessage
      ? withMessageId(message, messageId)
      : message;

  pendingSendRef.current = buildPendingSend({
    message: messageWithId,
    options,
    messageId,
    optimisticMessage,
  });

  appendOptimisticMessage(setChatMessages, optimisticMessage);
  void createThread(getThreadName(message, options));
};

const useChatTransport = (apiUrl: string, accessToken: string | null) =>
  useMemo(
    () =>
      new DefaultChatTransport({
        api: `${apiUrl}/ai/chat`,
        headers: () => {
          return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
        },
      }),
    [apiUrl, accessToken],
  );

const useVercelChat = ({
  apiUrl,
  assistantId,
  threadId,
  accessToken,
}: {
  apiUrl: string;
  assistantId: string;
  threadId: string | null;
  accessToken: string | null;
}) => {
  const transport = useChatTransport(apiUrl, accessToken);
  const chatOptions: UseChatOptions<UIMessage> = {
    transport,
    onError: (error) => {
      reportStreamError(error, {
        operation: "vercel_ai_stream",
        component: "useVercelAIChat",
        additionalData: { threadId, assistantId },
      });
    },
  };

  if (threadId) {
    chatOptions.id = threadId;
  }

  return useChat<UIMessage>(chatOptions);
};

const useThreadCreator = ({
  apiUrl,
  assistantId,
  accessToken,
  onThreadId,
  setLocalError,
  setIsCreatingThread,
  createThreadInFlightRef,
}: {
  apiUrl: string;
  assistantId: string;
  accessToken: string | null;
  onThreadId?: (id: string) => void;
  setLocalError: Dispatch<SetStateAction<Error | null>>;
  setIsCreatingThread: Dispatch<SetStateAction<boolean>>;
  createThreadInFlightRef: MutableRefObject<boolean>;
}) =>
  useCallback(
    async (name: string | undefined): Promise<string | null> => {
      if (!accessToken) {
        setLocalError(new Error("No access token available"));
        return null;
      }

      if (createThreadInFlightRef.current) {
        return null;
      }

      createThreadInFlightRef.current = true;
      setIsCreatingThread(true);
      try {
        const response = await fetch(`${apiUrl}/ai/threads`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(name ? { name } : {}),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to create thread: ${response.status} ${response.statusText}`,
          );
        }

        const thread = (await response.json()) as { id: string };
        if (thread.id && onThreadId) {
          onThreadId(thread.id);
        }
        return thread.id;
      } catch (err) {
        const nextError =
          err instanceof Error ? err : new Error("Failed to create thread");
        setLocalError(nextError);
        reportStreamError(nextError, {
          operation: "create_thread",
          component: "useVercelAIChat",
          additionalData: { assistantId },
        });
        return null;
      } finally {
        setIsCreatingThread(false);
        createThreadInFlightRef.current = false;
      }
    },
    [
      apiUrl,
      assistantId,
      accessToken,
      onThreadId,
      setIsCreatingThread,
      setLocalError,
      createThreadInFlightRef,
    ],
  );

const usePendingSend = ({
  threadId,
  pendingSendRef,
  sendMessage,
  setChatMessages,
}: {
  threadId: string | null;
  pendingSendRef: MutableRefObject<PendingSend | null>;
  sendMessage: ReturnType<typeof useChat<UIMessage>>["sendMessage"];
  setChatMessages: ReturnType<typeof useChat<UIMessage>>["setMessages"];
}) => {
  useEffect(() => {
    if (!threadId || !pendingSendRef.current) return;
    const pending = pendingSendRef.current;
    pendingSendRef.current = null;
    appendOptimisticMessage(setChatMessages, pending.optimisticMessage);
    void sendMessage(pending.message, pending.options);
  }, [threadId, pendingSendRef, sendMessage, setChatMessages]);
};

const useThreadLoader = ({
  apiUrl,
  assistantId,
  threadId,
  accessToken,
  loadedThreadIdRef,
  skipThreadLoadRef,
  setChatMessages,
  setIsLoadingThread,
  setLocalError,
}: {
  apiUrl: string;
  assistantId: string;
  threadId: string | null;
  accessToken: string | null;
  loadedThreadIdRef: MutableRefObject<string | null>;
  skipThreadLoadRef: MutableRefObject<boolean>;
  setChatMessages: ReturnType<typeof useChat<UIMessage>>["setMessages"];
  setIsLoadingThread: Dispatch<SetStateAction<boolean>>;
  setLocalError: Dispatch<SetStateAction<Error | null>>;
}) => {
  useEffect(() => {
    if (!threadId) {
      loadedThreadIdRef.current = null;
      setChatMessages([]);
      setLocalError(null);
      return;
    }

    if (!accessToken) {
      return;
    }

    if (loadedThreadIdRef.current === threadId) {
      return;
    }

    if (skipThreadLoadRef.current) {
      skipThreadLoadRef.current = false;
      loadedThreadIdRef.current = threadId;
      return;
    }

    loadedThreadIdRef.current = threadId;
    setIsLoadingThread(true);
    setLocalError(null);
    const controller = new AbortController();

    const loadThread = async () => {
      try {
        const response = await fetch(`${apiUrl}/ai/threads/${threadId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const error = new Error(
            response.status === 404
              ? "Thread not found (404)"
              : `Failed to load thread: ${response.status}`,
          );
          (error as { status?: number }).status = response.status;
          throw error;
        }

        const data = (await response.json()) as {
          messages?: UIMessage[];
        };
        setChatMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const nextError =
          err instanceof Error ? err : new Error("Failed to load thread");
        setLocalError(nextError);
        reportStreamError(nextError, {
          operation: "load_thread",
          component: "useVercelAIChat",
          additionalData: { threadId, assistantId },
        });
      } finally {
        setIsLoadingThread(false);
      }
    };

    void loadThread();

    return () => controller.abort();
  }, [
    apiUrl,
    assistantId,
    threadId,
    accessToken,
    loadedThreadIdRef,
    skipThreadLoadRef,
    setChatMessages,
    setIsLoadingThread,
    setLocalError,
  ]);
};

const useSendMessageWithThread = ({
  threadId,
  accessToken,
  pendingSendRef,
  skipThreadLoadRef,
  createThread,
  sendMessage,
  setChatMessages,
  setLocalError,
}: {
  threadId: string | null;
  accessToken: string | null;
  pendingSendRef: MutableRefObject<PendingSend | null>;
  skipThreadLoadRef: MutableRefObject<boolean>;
  createThread: (name: string | undefined) => Promise<string | null>;
  sendMessage: ReturnType<typeof useChat<UIMessage>>["sendMessage"];
  setChatMessages: ReturnType<typeof useChat<UIMessage>>["setMessages"];
  setLocalError: Dispatch<SetStateAction<Error | null>>;
}) =>
  useCallback(
    async (message?: SendMessageInput, options?: ChatRequestOptions) => {
      setLocalError(null);

      if (!accessToken) {
        setLocalError(new Error("No access token available"));
        return;
      }

      if (!threadId) {
        queuePendingSend({
          message,
          options,
          pendingSendRef,
          skipThreadLoadRef,
          createThread,
          setChatMessages,
        });
        return;
      }

      await sendMessage(message, options);
    },
    [
      accessToken,
      createThread,
      pendingSendRef,
      skipThreadLoadRef,
      sendMessage,
      setChatMessages,
      setLocalError,
      threadId,
    ],
  );

export function useVercelAIChat(cfg: UseVercelAIChatConfig): StreamContextType {
  const { apiUrl, assistantId, threadId, accessToken, onThreadId } = cfg;
  const [localError, setLocalError] = useState<Error | null>(null);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const pendingSendRef = useRef<PendingSend | null>(null);
  const loadedThreadIdRef = useRef<string | null>(null);
  const skipThreadLoadRef = useRef(false);
  const createThreadInFlightRef = useRef(false);

  const {
    id,
    messages,
    sendMessage,
    regenerate,
    status,
    error: chatError,
    stop,
    clearError: clearChatError,
    resumeStream,
    setMessages: setChatMessages,
    addToolOutput,
    addToolResult,
  } = useVercelChat({ apiUrl, assistantId, threadId, accessToken });

  const isLoading =
    isCreatingThread ||
    isLoadingThread ||
    status === "submitted" ||
    status === "streaming";

  const error = localError ?? chatError;

  const clearError = useCallback(() => {
    setLocalError(null);
    clearChatError();
  }, [clearChatError]);

  const createThread = useThreadCreator({
    apiUrl,
    assistantId,
    accessToken,
    ...(onThreadId ? { onThreadId } : {}),
    setLocalError,
    setIsCreatingThread,
    createThreadInFlightRef,
  });

  const sendMessageWithThread = useSendMessageWithThread({
    threadId,
    accessToken,
    pendingSendRef,
    skipThreadLoadRef,
    createThread,
    sendMessage,
    setChatMessages,
    setLocalError,
  });

  usePendingSend({ threadId, pendingSendRef, sendMessage, setChatMessages });

  useThreadLoader({
    apiUrl,
    assistantId,
    threadId,
    accessToken,
    loadedThreadIdRef,
    skipThreadLoadRef,
    setChatMessages,
    setIsLoadingThread,
    setLocalError,
  });

  return {
    id,
    messages,
    sendMessage: sendMessageWithThread,
    regenerate,
    stop,
    clearError,
    error,
    resumeStream,
    setMessages: setChatMessages,
    status,
    addToolOutput,
    addToolResult,
    threadId,
    isLoading,
  };
}
