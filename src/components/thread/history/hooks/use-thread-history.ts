import { useEffect } from "react";
import { useQueryState, parseAsBoolean } from "nuqs";
import { useThreads } from "@/providers/thread";
import { useMediaQuery } from "@/hooks/use-media-query";

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
    setThreadsLoading(true);
    getThreads()
      .then(setThreads)
      .catch(console.error)
      .finally(() => setThreadsLoading(false));
  }, [getThreads, setThreads, setThreadsLoading]);

  return {
    isLargeScreen,
    chatHistoryOpen,
    setChatHistoryOpen,
    threads,
    threadsLoading,
  };
}
