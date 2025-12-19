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
import { DefaultChatTransport, type UIMessage as VercelUIMessage } from "ai";
import type {
  GraphState,
  StreamContextType,
  SubmitConfig,
  SubmitData,
  UIMessage,
} from "../stream-types";
import { uiToVercelMessage, vercelMessagesToUI } from "../message-adapter";
import { reportStreamError } from "@/core/services/observability";

interface UseVercelAIChatConfig {
  apiUrl: string;
  assistantId: string;
  threadId: string | null;
  accessToken: string | null;
  onThreadId?: (id: string) => void;
}

const MAX_THREAD_NAME_LENGTH = 50;

const getMessageContentString = (message: UIMessage | undefined): string => {
  if (!message) return "";
  const content = message.content;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((block) => block.type === "text")
    .map((block) => ("text" in block ? block.text : ""))
    .join(" ")
    .trim();
};

const getThreadName = (
  data: SubmitData | null,
  config?: SubmitConfig,
): string | undefined => {
  const configuredName = config?.metadata?.name;
  if (typeof configuredName === "string" && configuredName.trim()) {
    return configuredName.trim().slice(0, MAX_THREAD_NAME_LENGTH);
  }

  const firstHuman = data?.messages?.find((msg) => msg.type === "human");
  const fromMessage = getMessageContentString(firstHuman);
  if (fromMessage) {
    return fromMessage.slice(0, MAX_THREAD_NAME_LENGTH);
  }

  return undefined;
};

const buildRequestBody = (
  data: SubmitData | null,
  config?: SubmitConfig,
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};

  if (data?.context) {
    body.context = data.context;
  }

  if (config?.metadata) {
    body.metadata = config.metadata;
  }

  if (config?.config?.configurable) {
    body.configurable = config.config.configurable;
  }

  return body;
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
  const chatOptions: UseChatOptions<VercelUIMessage> = {
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

  return useChat<VercelUIMessage>(chatOptions);
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

const useSendChatMessage = ({
  sendMessage,
  setLocalError,
}: {
  sendMessage: ReturnType<typeof useChat<VercelUIMessage>>["sendMessage"];
  setLocalError: Dispatch<SetStateAction<Error | null>>;
}) =>
  useCallback(
    (data: SubmitData | null, config?: SubmitConfig) => {
      const requestBody = buildRequestBody(data, config);
      const sendOptions =
        Object.keys(requestBody).length > 0 ? { body: requestBody } : undefined;

      const lastHumanMessage = data?.messages
        ?.filter((msg) => msg.type === "human")
        .slice(-1)[0];

      if (lastHumanMessage) {
        const vercelMessage = uiToVercelMessage(lastHumanMessage);
        if (!vercelMessage) {
          setLocalError(new Error("Unable to send message"));
          return;
        }
        void sendMessage(
          {
            id: vercelMessage.id,
            role: vercelMessage.role,
            parts: vercelMessage.parts,
          },
          sendOptions,
        );
        return;
      }

      void sendMessage(undefined, sendOptions);
    },
    [sendMessage, setLocalError],
  );

const usePendingSubmit = ({
  threadId,
  pendingSubmitRef,
  sendChatMessage,
}: {
  threadId: string | null;
  pendingSubmitRef: MutableRefObject<{
    data: SubmitData | null;
    config?: SubmitConfig;
  } | null>;
  sendChatMessage: (data: SubmitData | null, config?: SubmitConfig) => void;
}) => {
  useEffect(() => {
    if (!threadId || !pendingSubmitRef.current) return;
    const pending = pendingSubmitRef.current;
    pendingSubmitRef.current = null;
    sendChatMessage(pending.data, pending.config);
  }, [threadId, pendingSubmitRef, sendChatMessage]);
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
  setChatMessages: ReturnType<typeof useChat<VercelUIMessage>>["setMessages"];
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
          messages?: VercelUIMessage[];
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

const useSubmitHandler = ({
  threadId,
  accessToken,
  pendingSubmitRef,
  skipThreadLoadRef,
  createThread,
  sendChatMessage,
  setLocalError,
}: {
  threadId: string | null;
  accessToken: string | null;
  pendingSubmitRef: MutableRefObject<{
    data: SubmitData | null;
    config?: SubmitConfig;
  } | null>;
  skipThreadLoadRef: MutableRefObject<boolean>;
  createThread: (name: string | undefined) => Promise<string | null>;
  sendChatMessage: (data: SubmitData | null, config?: SubmitConfig) => void;
  setLocalError: Dispatch<SetStateAction<Error | null>>;
}) =>
  useCallback(
    (data: SubmitData | null, config?: SubmitConfig) => {
      setLocalError(null);

      if (!accessToken) {
        setLocalError(new Error("No access token available"));
        return;
      }

      if (!threadId) {
        skipThreadLoadRef.current = true;
        pendingSubmitRef.current = config ? { data, config } : { data };
        void createThread(getThreadName(data, config));
        return;
      }

      sendChatMessage(data, config);
    },
    [
      accessToken,
      createThread,
      pendingSubmitRef,
      skipThreadLoadRef,
      sendChatMessage,
      setLocalError,
      threadId,
    ],
  );

const useMappedMessagesSetter = ({
  messages,
  setChatMessages,
}: {
  messages: UIMessage[];
  setChatMessages: ReturnType<typeof useChat<VercelUIMessage>>["setMessages"];
}) =>
  useCallback(
    (nextMessages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => {
      const resolved =
        typeof nextMessages === "function"
          ? nextMessages(messages)
          : nextMessages;
      const mapped = resolved
        .map((msg) => uiToVercelMessage(msg))
        .filter((msg): msg is VercelUIMessage => Boolean(msg));
      setChatMessages(mapped);
    },
    [messages, setChatMessages],
  );

export function useVercelAIChat(cfg: UseVercelAIChatConfig): StreamContextType {
  const { apiUrl, assistantId, threadId, accessToken, onThreadId } = cfg;
  const [localError, setLocalError] = useState<Error | null>(null);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const pendingSubmitRef = useRef<{
    data: SubmitData | null;
    config?: SubmitConfig;
  } | null>(null);
  const loadedThreadIdRef = useRef<string | null>(null);
  const skipThreadLoadRef = useRef(false);
  const createThreadInFlightRef = useRef(false);

  const {
    messages: vercelMessages,
    sendMessage,
    regenerate,
    status,
    error: chatError,
    stop: stopChat,
    clearError: clearChatError,
    resumeStream,
    setMessages: setChatMessages,
  } = useVercelChat({ apiUrl, assistantId, threadId, accessToken });

  const messages = useMemo(
    () => vercelMessagesToUI(vercelMessages),
    [vercelMessages],
  );

  const isLoading =
    isCreatingThread ||
    isLoadingThread ||
    status === "submitted" ||
    status === "streaming";

  const error = localError ?? chatError ?? null;

  const clearError = useCallback(() => {
    setLocalError(null);
    clearChatError();
  }, [clearChatError]);

  const retryStream = useCallback(async () => {
    clearError();
    try {
      await resumeStream();
    } catch (err) {
      const nextError =
        err instanceof Error ? err : new Error("Failed to resume stream");
      setLocalError(nextError);
    }
  }, [clearError, resumeStream]);

  const stop = useCallback(() => {
    stopChat();
  }, [stopChat]);

  const createThread = useThreadCreator({
    apiUrl,
    assistantId,
    accessToken,
    ...(onThreadId ? { onThreadId } : {}),
    setLocalError,
    setIsCreatingThread,
    createThreadInFlightRef,
  });

  const sendChatMessage = useSendChatMessage({ sendMessage, setLocalError });

  const submit = useSubmitHandler({
    threadId,
    accessToken,
    pendingSubmitRef,
    skipThreadLoadRef,
    createThread,
    sendChatMessage,
    setLocalError,
  });
  usePendingSubmit({ threadId, pendingSubmitRef, sendChatMessage });

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

  const setMessages = useMappedMessagesSetter({ messages, setChatMessages });

  return {
    messages,
    isLoading,
    error,
    threadId,
    currentRunId: null,
    values: { messages, sources: [] } as GraphState,
    submit,
    stop,
    regenerate,
    clearError,
    retryStream,
    setMessages,
  };
}
