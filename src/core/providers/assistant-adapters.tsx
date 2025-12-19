import { useCallback, useMemo, type FC, type PropsWithChildren } from "react";
import {
  type ThreadMessage,
  RuntimeAdapterProvider,
  useAssistantApi,
  type ThreadHistoryAdapter,
} from "@assistant-ui/react";
import type { AssistantStream } from "assistant-stream";
import type { AssistantStreamChunk } from "assistant-stream";
import type { FetchWithAuth } from "@/core/services/http-client";

// Backend message type
type BackendMessage = { id: string; role: string; content: string };

// Fetches messages from backend for a thread
async function fetchThreadMessages(
  apiUrl: string,
  fetchWithAuth: FetchWithAuth,
  remoteId: string,
): Promise<BackendMessage[]> {
  const res = await fetchWithAuth(`${apiUrl}/ai/threads/${remoteId}`);
  if (!res.ok) {
    console.log("[history] Fetch failed:", res.status);
    return [];
  }
  const data = await res.json();
  return data.messages ?? [];
}

// Creates the withFormat adapter for AI SDK compatibility
function createWithFormatAdapter<TMessage>(
  apiUrl: string,
  fetchWithAuth: FetchWithAuth,
  getRemoteId: () => string | undefined,
) {
  return {
    async load(): Promise<{
      headId?: string | null;
      messages: Array<{ parentId: string | null; message: TMessage }>;
    }> {
      const remoteId = getRemoteId();
      console.log("[history.withFormat.load] Called, remoteId:", remoteId);
      if (!remoteId) return { messages: [] };

      try {
        const backendMessages = await fetchThreadMessages(
          apiUrl,
          fetchWithAuth,
          remoteId,
        );
        console.log(
          "[history.withFormat.load] Loaded messages:",
          backendMessages.length,
        );
        // Debug: log raw backend messages to see content
        console.log("[history.withFormat.load] Raw backend messages:", JSON.stringify(backendMessages, null, 2));

        // Filter out messages with null/undefined/empty content to avoid .trim() errors
        const validMessages = backendMessages.filter((m) => {
          const hasContent = m.content != null && typeof m.content === "string" && m.content.trim().length > 0;
          if (!hasContent) {
            console.log("[history.withFormat.load] Filtering out message with invalid content:", m.id, m.content);
          }
          return hasContent;
        });
        console.log("[history.withFormat.load] Valid messages after filter:", validMessages.length);

        // Convert to UIMessage format expected by AI SDK
        const messages = validMessages.map((m, index, filtered) => ({
          parentId: index > 0 ? filtered[index - 1]!.id : null,
          message: {
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
            parts: [{ type: "text" as const, text: m.content }],
            createdAt: new Date(),
          } as TMessage,
        }));

        console.log(
          "[history.withFormat.load] Converted messages:",
          messages.length,
        );

        // Debug: log first message to verify format
        if (messages.length > 0) {
          console.log("[history.withFormat.load] First message:", JSON.stringify(messages[0], null, 2));
        }

        // headId should be the ID of the last message (string), not the message object
        // BUG FIX: was returning message object instead of message.id
        const lastMsgId = messages.length > 0
          ? (messages[messages.length - 1]!.message as { id: string }).id
          : null;
        console.log("[history.withFormat.load] headId:", lastMsgId);

        return {
          headId: lastMsgId,
          messages,
        };
      } catch (error) {
        console.error("[history.withFormat.load] Error:", error);
        return { messages: [] };
      }
    },
    async append() {
      // No-op: backend persists messages via SSE on_complete callback
    },
  };
}

// Backend thread history adapter - loads messages from backend
const useBackendThreadHistoryAdapter = (
  apiUrl: string,
  fetchWithAuth: FetchWithAuth,
): ThreadHistoryAdapter => {
  const api = useAssistantApi();

  return useMemo(
    () => ({
      // This load() method is NOT called when withFormat is implemented.
      // The AI SDK runtime uses withFormat().load() instead.
      // But we must implement it for the ThreadHistoryAdapter interface.
      async load() {
        console.log("[history.load] Called - should not be called when withFormat exists");
        return { messages: [] };
      },

      async append() {
        // No-op: backend persists messages via SSE on_complete callback
      },

      // withFormat is the actual method used by useAISDKRuntime
      withFormat<TMessage>() {
        return createWithFormatAdapter<TMessage>(apiUrl, fetchWithAuth, () =>
          api.threadListItem().getState().remoteId,
        );
      },
    }),
    [api, apiUrl, fetchWithAuth],
  );
};

// Thread list adapter type (matches library's expected interface)
type RemoteThreadListAdapter = {
  list(): Promise<{
    threads: Array<{
      status: "regular" | "archived";
      remoteId: string;
      title?: string;
    }>;
  }>;
  rename(remoteId: string, newTitle: string): Promise<void>;
  archive(remoteId: string): Promise<void>;
  unarchive(remoteId: string): Promise<void>;
  delete(remoteId: string): Promise<void>;
  initialize(
    threadId: string,
  ): Promise<{ remoteId: string; externalId: string | undefined }>;
  generateTitle(
    remoteId: string,
    unstable_messages: readonly ThreadMessage[],
  ): Promise<AssistantStream>;
  fetch(threadId: string): Promise<{
    status: "regular" | "archived";
    remoteId: string;
    title?: string;
    externalId?: string;
  }>;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  unstable_Provider?: FC<PropsWithChildren>;
};

// Hook that creates the thread list adapter with history provider
// eslint-disable-next-line max-lines-per-function -- adapter cohesively groups all related methods
export const useBackendThreadListAdapter = (
  apiUrl: string,
  fetchWithAuth: FetchWithAuth,
  _getAccessTokenSilently: () => Promise<string>,
  isAuthenticated: boolean,
): RemoteThreadListAdapter => {
  // Create the Provider component that injects history adapter
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const unstable_Provider = useCallback<FC<PropsWithChildren>>(
    function Provider({ children }) {
      console.log('[unstable_Provider] Rendering');
      const history = useBackendThreadHistoryAdapter(apiUrl, fetchWithAuth);
      console.log('[unstable_Provider] Created history adapter:', !!history);
      return (
        <RuntimeAdapterProvider adapters={{ history }}>
          {children}
        </RuntimeAdapterProvider>
      );
    },
    [apiUrl, fetchWithAuth],
  );

  // Thread list operations
  const list = useCallback(async () => {
    console.log('[adapter.list] Called, isAuthenticated:', isAuthenticated);
    // Return empty if not authenticated yet - runtime will re-fetch when auth completes
    if (!isAuthenticated) {
      console.log('[adapter.list] Not authenticated, returning empty');
      return { threads: [] };
    }
    const res = await fetchWithAuth(`${apiUrl}/ai/threads`);
    if (!res.ok) {
      throw new Error(`Failed to list threads: ${res.status}`);
    }
    const threads: Array<{ id: string; name: string }> = await res.json();
    console.log('[adapter.list] Loaded threads:', threads);
    return {
      threads: threads.map((t) => ({
        status: "regular" as const,
        remoteId: t.id,
        title: t.name,
      })),
    };
  }, [apiUrl, fetchWithAuth, isAuthenticated]);

  const rename = useCallback(
    async (remoteId: string, newTitle: string) => {
      const res = await fetchWithAuth(`${apiUrl}/ai/threads/${remoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTitle }),
      });
      if (!res.ok) {
        throw new Error(`Failed to rename thread: ${res.status}`);
      }
    },
    [apiUrl, fetchWithAuth],
  );

  const deleteThread = useCallback(
    async (remoteId: string) => {
      const res = await fetchWithAuth(`${apiUrl}/ai/threads/${remoteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Failed to delete thread: ${res.status}`);
      }
    },
    [apiUrl, fetchWithAuth],
  );

  const initialize = useCallback(async () => {
    console.log('[adapter.initialize] Creating new thread');
    const res = await fetchWithAuth(`${apiUrl}/ai/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Chat" }),
    });
    if (!res.ok) {
      throw new Error(`Failed to create thread: ${res.status}`);
    }
    const data = await res.json();
    console.log('[adapter.initialize] Created thread:', data.id);
    return { remoteId: data.id, externalId: "" };
  }, [apiUrl, fetchWithAuth]);

  const generateTitle = useCallback(
    async (
      remoteId: string,
      messages: readonly ThreadMessage[],
    ): Promise<AssistantStream> => {
      // Extract title from first user message
      const firstUserMessage = messages.find((m) => m.role === "user");
      let title = "New Chat";

      if (firstUserMessage?.content) {
        for (const part of firstUserMessage.content) {
          if (part.type === "text" && part.text) {
            const text = part.text.trim();
            title = text.length > 50 ? text.slice(0, 47) + "..." : text;
            break;
          }
        }
      }

      // Persist title to backend
      await fetchWithAuth(`${apiUrl}/ai/threads/${remoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: title }),
      });

      // Return an AssistantStream that emits the title for local state update
      const chunks: AssistantStreamChunk[] = [
        { path: [0], type: "part-start", part: { type: "text" } },
        { path: [0], type: "text-delta", textDelta: title },
        { path: [0], type: "part-finish" },
      ];

      return new ReadableStream<AssistantStreamChunk>({
        start(controller) {
          for (const chunk of chunks) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      });
    },
    [apiUrl, fetchWithAuth],
  );

  const fetchThread = useCallback(
    async (threadId: string) => {
      console.log('[adapter.fetch] Fetching thread:', threadId);
      // Return minimal data if not authenticated yet
      if (!isAuthenticated) {
        console.log('[adapter.fetch] Not authenticated, returning minimal data');
        return {
          status: "regular" as const,
          remoteId: threadId,
          title: undefined,
        };
      }
      const res = await fetchWithAuth(`${apiUrl}/ai/threads/${threadId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch thread: ${res.status}`);
      }
      const thread = await res.json();
      return {
        status: "regular" as const,
        remoteId: thread.id,
        title: thread.name,
      };
    },
    [apiUrl, fetchWithAuth, isAuthenticated],
  );

  return useMemo(
    () => ({
      list,
      rename,
      delete: deleteThread,
      archive: async () => {
        /* Not supported */
      },
      unarchive: async () => {
        /* Not supported */
      },
      initialize,
      generateTitle,
      fetch: fetchThread,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      unstable_Provider,
    }),
    [
      list,
      rename,
      deleteThread,
      initialize,
      generateTitle,
      fetchThread,
      unstable_Provider,
    ],
  );
};
