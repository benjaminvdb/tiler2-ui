import React, { useEffect, useRef } from "react";
import { useQueryState } from "nuqs";
import {
  uiMessageReducer,
  isUIMessage,
  isRemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { toast } from "sonner";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { StreamContext } from "./stream-context";
import { useTypedStream, StreamSessionProps } from "./types";
import { sleep, checkGraphStatus } from "./utils";

export const StreamSession: React.FC<StreamSessionProps> = ({
  children,
  apiUrl,
  assistantId,
}) => {
  const [threadId, setThreadId] = useQueryState("threadId");
  const { getThreads, setThreads } = useThreads();
  const threadFetchControllerRef = useRef<AbortController | null>(null);
  const streamValue = useTypedStream({
    apiUrl,
    apiKey: undefined, // API key is handled server-side
    assistantId,
    threadId: threadId ?? null,
    onCustomEvent: (event, options) => {
      if (isUIMessage(event) || isRemoveUIMessage(event)) {
        options.mutate((prev) => {
          const ui = uiMessageReducer(prev.ui ?? [], event);
          return { ...prev, ui };
        });
      }
    },
    onThreadId: (id) => {
      setThreadId(id);

      // Cancel any previous thread fetch operation
      if (threadFetchControllerRef.current) {
        threadFetchControllerRef.current.abort();
      }
      // Create new controller for this fetch operation
      const controller = new AbortController();
      threadFetchControllerRef.current = controller;

      // Refetch threads list when thread ID changes.
      // Wait for some seconds before fetching so we're able to get the new thread that was created.
      const fetchThreadsWithDelay = async () => {
        try {
          await sleep(4000, controller.signal);

          if (controller.signal.aborted) {
            throw new DOMException("Aborted", "AbortError");
          }
          const threads = await getThreads();

          if (!controller.signal.aborted) {
            setThreads(threads);
          }
        } catch (error: unknown) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Failed to fetch threads:", error);
          }
        }
      };

      fetchThreadsWithDelay();
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    const checkStatus = async () => {
      try {
        const ok = await checkGraphStatus(apiUrl, null, controller.signal);

        // Only show toast if component is still mounted
        if (!controller.signal.aborted && !ok) {
          toast.error("Failed to connect to LangGraph server", {
            description: () => (
              <p>
                Please ensure your graph is running at <code>{apiUrl}</code> and
                your API key is correctly set (if connecting to a deployed
                graph).
              </p>
            ),
            duration: 10000,
            richColors: true,
            closeButton: true,
          });
        }
      } catch (error: unknown) {
        // Don't show errors for aborted requests
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to check graph status:", error);
        }
      }
    };

    checkStatus();

    return () => {
      controller.abort();
      // Also cancel any pending thread fetch operations
      if (threadFetchControllerRef.current) {
        threadFetchControllerRef.current.abort();
      }
    };
  }, [apiUrl]);

  return (
    <StreamContext.Provider value={streamValue}>
      {children}
    </StreamContext.Provider>
  );
};
