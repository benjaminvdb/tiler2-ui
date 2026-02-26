/**
 * Hook managing thread history state, including initial fetch with auth delay and responsive sidebar behavior.
 */
import { useEffect, useRef } from "react";
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

  const getThreadsRef = useRef(getThreads);
  const resetThreadsRef = useRef(resetThreads);
  const setThreadsLoadingRef = useRef(setThreadsLoading);

  getThreadsRef.current = getThreads;
  resetThreadsRef.current = resetThreads;
  setThreadsLoadingRef.current = setThreadsLoading;

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isCancelled = false;

    const fetchThreads = async () => {
      setThreadsLoadingRef.current(true);
      try {
        const fetchedThreads = await getThreadsRef.current();
        if (!isCancelled) {
          resetThreadsRef.current(fetchedThreads);
        }
      } catch (error) {
        reportThreadError(error as Error, {
          operation: "fetchThreads",
          component: "useThreadHistory",
        });
      } finally {
        if (!isCancelled) {
          setThreadsLoadingRef.current(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchThreads, AUTH_BOOTSTRAP_DELAY_MS);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

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
