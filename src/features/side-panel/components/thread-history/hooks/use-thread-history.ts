import { useEffect } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { reportThreadError } from "@/core/services/observability";

/**
 * Allows the Auth0 SDK to hydrate tokens before fetching private data.
 */
const AUTH_BOOTSTRAP_DELAY_MS = 200;

export function useThreadHistory() {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] =
    useSearchParamState("chatHistoryOpen");

  const {
    getThreads,
    threads,
    resetThreads,
    threadsLoading,
    setThreadsLoading,
  } = useThreads();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchThreads = async () => {
      setThreadsLoading(true);
      try {
        const fetchedThreads = await getThreads();
        resetThreads(fetchedThreads);
      } catch (error) {
        reportThreadError(error as Error, {
          operation: "fetchThreads",
          component: "useThreadHistory",
        });
      } finally {
        setThreadsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchThreads, AUTH_BOOTSTRAP_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [getThreads, resetThreads, setThreadsLoading]);

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
