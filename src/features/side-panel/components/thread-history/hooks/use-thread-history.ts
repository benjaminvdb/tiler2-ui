import { useEffect } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { reportThreadError } from "@/core/services/error-reporting";

export function useThreadHistory() {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] =
    useSearchParamState("chatHistoryOpen");

  const { getThreads, threads, setThreads, threadsLoading, setThreadsLoading } =
    useThreads();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchThreads = async () => {
      setThreadsLoading(true);
      try {
        const fetchedThreads = await getThreads();
        setThreads(fetchedThreads);
      } catch (error) {
        // fetchWithAuth has built-in retry logic with Auth0 token management
        // Only report if all retries exhausted
        reportThreadError(error as Error, {
          operation: "fetchThreads",
          component: "useThreadHistory",
        });
      } finally {
        setThreadsLoading(false);
      }
    };

    // CRITICAL FIX: Defer initial fetch by 200ms
    // Allows Auth0 SDK to initialize and prevents race condition during initial load
    const timeoutId = setTimeout(fetchThreads, 200);

    return () => clearTimeout(timeoutId);
  }, [getThreads, setThreads, setThreadsLoading]);

  return {
    isLargeScreen,
    chatHistoryOpen: chatHistoryOpen === true,
    setChatHistoryOpen: (value: boolean | ((prev: boolean) => boolean)) => {
      if (typeof value === "function") {
        const prevBool = chatHistoryOpen === true;
        const newValue = value(prevBool);
        setChatHistoryOpen(newValue ? true : null);
      } else {
        setChatHistoryOpen(value ? true : null);
      }
    },
    threads,
    threadsLoading,
  };
}
