import { useEffect } from "react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { reportThreadError } from "@/core/services/error-reporting";

export function useThreadHistory() {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );

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
        reportThreadError(error as Error, {
          operation: "fetchThreads",
          component: "useThreadHistory",
        });
      } finally {
        setThreadsLoading(false);
      }
    };

    fetchThreads();
  }, [getThreads, setThreads, setThreadsLoading]);

  return {
    isLargeScreen,
    chatHistoryOpen,
    setChatHistoryOpen,
    threads,
    threadsLoading,
  };
}
