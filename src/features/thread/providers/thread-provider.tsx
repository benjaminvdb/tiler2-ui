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
import { reportThreadError } from "@/core/services/error-reporting";
import { fetchWithAuth } from "@/core/services/http-client";

interface ThreadContextType {
  getThreads: () => Promise<Thread[]>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<Thread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
  deleteThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, newName: string) => Promise<void>;
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

export const ThreadProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);

  const getThreads = useCallback(async (): Promise<Thread[]> => {
    if (!apiUrl || !assistantId) return [];

    try {
      const response = await fetchWithAuth(`${apiUrl}/threads/search`, {
        method: "POST",
        timeoutMs: 10000, // 10 second timeout for thread list query
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: {
            ...getThreadSearchMetadata(assistantId),
          },
          limit: 100,
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
  }, [apiUrl, assistantId]);

  const deleteThread = useCallback(
    async (threadId: string): Promise<void> => {
      if (!apiUrl) {
        throw new Error("API URL not configured");
      }

      try {
        const response = await fetchWithAuth(`${apiUrl}/threads/${threadId}`, {
          method: "DELETE",
          timeoutMs: 5000, // 5 second timeout for delete operation
        });

        if (!response.ok) {
          throw new Error(`Failed to delete thread: ${response.status}`);
        }

        // Optimistically update local state
        setThreads((prev) => prev.filter((t) => t.thread_id !== threadId));
      } catch (error) {
        reportThreadError(error as Error, {
          operation: "deleteThread",
          component: "ThreadProvider",
          url: apiUrl,
          threadId,
        });
        throw error; // Re-throw for UI handling
      }
    },
    [apiUrl],
  );

  const renameThread = useCallback(
    async (threadId: string, newName: string): Promise<void> => {
      if (!apiUrl) {
        throw new Error("API URL not configured");
      }

      const trimmedName = newName.trim();
      if (trimmedName === "") {
        throw new Error("Thread name cannot be empty");
      }

      // Store previous state for rollback
      const previousThreads = threads;

      try {
        // Optimistically update local state
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

        // Update with server response to ensure sync
        const updatedThread: Thread = await response.json();
        setThreads((prev) =>
          prev.map((t) => (t.thread_id === threadId ? updatedThread : t)),
        );
      } catch (error) {
        // Rollback optimistic update on error
        setThreads(previousThreads);

        reportThreadError(error as Error, {
          operation: "renameThread",
          component: "ThreadProvider",
          url: apiUrl,
          threadId,
        });
        throw error; // Re-throw for UI handling
      }
    },
    [apiUrl, threads],
  );

  const value = {
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,
    deleteThread,
    renameThread,
  };

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
};
export const useThreads = () => {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreads must be used within a ThreadProvider");
  }
  return context;
};
