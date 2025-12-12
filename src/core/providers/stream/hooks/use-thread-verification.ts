import { useCallback } from "react";
import { toast } from "sonner";
import type { Logger } from "@/core/services/observability";
import { sleep } from "../utils";
import type { Thread } from "@/features/thread/providers/thread-provider";

const THREAD_SYNC_DELAY_MS = 500;

interface UseThreadVerificationProps {
  getThreads: () => Promise<Thread[]>;
  resetThreads: (threads: Thread[]) => void;
  removeOptimisticThread: (id: string) => void;
  logger: Logger;
}

/**
 * Hook to verify thread creation and handle errors
 */
export function useThreadVerification({
  getThreads,
  resetThreads,
  removeOptimisticThread,
  logger,
}: UseThreadVerificationProps) {
  return useCallback(
    async (id: string) => {
      try {
        await sleep(THREAD_SYNC_DELAY_MS);
        const threads = await getThreads();
        resetThreads(threads);
        logger.info("Thread created successfully", {
          operation: "thread_creation_confirmed",
          threadId: id,
        });
      } catch (error) {
        if (error instanceof Error) {
          logger.error(error, {
            operation: "thread_creation_failed",
            threadId: id,
          });
          removeOptimisticThread(id);
          toast.error("Failed to create conversation", {
            description: "Please try sending your message again.",
          });
        }
      }
    },
    [getThreads, logger, removeOptimisticThread, resetThreads],
  );
}
