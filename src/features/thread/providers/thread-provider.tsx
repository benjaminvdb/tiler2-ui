import { validate } from "uuid";
import { Thread } from "@langchain/langgraph-sdk";
import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { reportThreadError } from "@/core/services/observability";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { getClientConfig } from "@/core/config/client";
import { PAGINATION_CONFIG } from "@/shared/constants/pagination";

const THREAD_LIST_TIMEOUT_MS = 10000;
const THREAD_DELETE_TIMEOUT_MS = 5000;

interface ThreadContextType {
  getThreads: () => Promise<Thread[]>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<Thread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
  deleteThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, newName: string) => Promise<void>;
  addOptimisticThread: (thread: Thread) => void;
  removeOptimisticThread: (threadId: string) => void;
  updateThreadInList: (threadId: string, updates: Partial<Thread>) => void;
  loadMoreThreads: () => Promise<void>;
  hasMoreThreads: boolean;
  isLoadingMore: boolean;
}
const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

const getThreadSearchMetadata = (
  assistantId: string,
): { graph_id: string } | { assistant_id: string } => {
  if (validate(assistantId)) {
    return { assistant_id: assistantId };
  } else {
    return { graph_id: assistantId };
  }
};

/**
 * Hook to get threads from API with pagination support
 */
function useGetThreads(
  apiUrl: string | undefined,
  assistantId: string | undefined,
  fetchWithAuth: ReturnType<typeof useAuthenticatedFetch>,
) {
  return useCallback(
    async (offset: number = 0): Promise<Thread[]> => {
      if (!apiUrl || !assistantId) return [];

      try {
        const response = await fetchWithAuth(`${apiUrl}/threads/search`, {
          method: "POST",
          timeoutMs: THREAD_LIST_TIMEOUT_MS,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metadata: {
              ...getThreadSearchMetadata(assistantId),
            },
            limit: PAGINATION_CONFIG.THREAD_LIST_PAGE_SIZE,
            offset,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const threads = await response.json();
        return threads;
      } catch (error) {
        reportThreadError(error as Error, {
          operation: "searchThreads",
          component: "ThreadProvider",
          url: apiUrl,
        });
        return [];
      }
    },
    [apiUrl, assistantId, fetchWithAuth],
  );
}

/**
 * Hook to delete a thread
 */
function useDeleteThread(
  apiUrl: string | undefined,
  fetchWithAuth: ReturnType<typeof useAuthenticatedFetch>,
  setThreads: Dispatch<SetStateAction<Thread[]>>,
) {
  return useCallback(
    async (threadId: string): Promise<void> => {
      if (!apiUrl) {
        throw new Error("API URL not configured");
      }

      try {
        const response = await fetchWithAuth(`${apiUrl}/threads/${threadId}`, {
          method: "DELETE",
          timeoutMs: THREAD_DELETE_TIMEOUT_MS,
        });

        if (!response.ok) {
          throw new Error(`Failed to delete thread: ${response.status}`);
        }

        setThreads((prev) => prev.filter((t) => t.thread_id !== threadId));
      } catch (error) {
        reportThreadError(error as Error, {
          operation: "deleteThread",
          component: "ThreadProvider",
          url: apiUrl,
          threadId,
        });
        throw error;
      }
    },
    [apiUrl, fetchWithAuth, setThreads],
  );
}

/**
 * Hook to rename a thread
 */
function useRenameThread(
  apiUrl: string | undefined,
  threads: Thread[],
  fetchWithAuth: ReturnType<typeof useAuthenticatedFetch>,
  setThreads: Dispatch<SetStateAction<Thread[]>>,
) {
  return useCallback(
    async (threadId: string, newName: string): Promise<void> => {
      if (!apiUrl) {
        throw new Error("API URL not configured");
      }

      const trimmedName = newName.trim();
      if (trimmedName === "") {
        throw new Error("Thread name cannot be empty");
      }

      const previousThreads = threads;

      try {
        setThreads((prev) =>
          prev.map((t) =>
            t.thread_id === threadId
              ? {
                  ...t,
                  metadata: { ...t.metadata, name: trimmedName },
                }
              : t,
          ),
        );

        const response = await fetchWithAuth(`${apiUrl}/threads/${threadId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            metadata: {
              name: trimmedName,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to rename thread: ${response.status}`);
        }

        const updatedThread: Thread = await response.json();
        setThreads((prev) =>
          prev.map((t) => (t.thread_id === threadId ? updatedThread : t)),
        );
      } catch (error) {
        setThreads(previousThreads);

        reportThreadError(error as Error, {
          operation: "renameThread",
          component: "ThreadProvider",
          url: apiUrl,
          threadId,
        });
        throw error;
      }
    },
    [apiUrl, threads, fetchWithAuth, setThreads],
  );
}

export const ThreadProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const config = getClientConfig();
  const apiUrl = config.apiUrl;
  const assistantId = config.assistantId;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const fetchWithAuth = useAuthenticatedFetch();

  const [offset, setOffset] = useState(0);
  const [hasMoreThreads, setHasMoreThreads] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getThreads = useGetThreads(apiUrl, assistantId, fetchWithAuth);
  const deleteThread = useDeleteThread(apiUrl, fetchWithAuth, setThreads);
  const renameThread = useRenameThread(
    apiUrl,
    threads,
    fetchWithAuth,
    setThreads,
  );

  const addOptimisticThread = useCallback((thread: Thread): void => {
    setThreads((prev) => [thread, ...prev]);
  }, []);

  const removeOptimisticThread = useCallback((threadId: string): void => {
    setThreads((prev) => prev.filter((t) => t.thread_id !== threadId));
  }, []);

  const updateThreadInList = useCallback(
    (threadId: string, updates: Partial<Thread>): void => {
      setThreads((prev) =>
        prev.map((t) => (t.thread_id === threadId ? { ...t, ...updates } : t)),
      );
    },
    [],
  );

  const loadMoreThreads = useCallback(async (): Promise<void> => {
    if (isLoadingMore || !hasMoreThreads) return;

    setIsLoadingMore(true);

    try {
      const newThreads = await getThreads(offset);

      if (newThreads.length < PAGINATION_CONFIG.THREAD_LIST_PAGE_SIZE) {
        setHasMoreThreads(false);
      }

      setThreads((prev) => [...prev, ...newThreads]);
      setOffset((prev) => prev + PAGINATION_CONFIG.THREAD_LIST_PAGE_SIZE);
    } catch (error) {
      reportThreadError(error as Error, {
        operation: "loadMoreThreads",
        component: "ThreadProvider",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreThreads, offset, getThreads]);

  const value = {
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,
    deleteThread,
    renameThread,
    addOptimisticThread,
    removeOptimisticThread,
    updateThreadInList,
    loadMoreThreads,
    hasMoreThreads,
    isLoadingMore,
  };

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components -- Hook exported alongside provider component (standard provider pattern)
export const useThreads = () => {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreads must be used within a ThreadProvider");
  }
  return context;
};
