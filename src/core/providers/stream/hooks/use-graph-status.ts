import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Logger } from "@/core/services/observability";
import { checkGraphStatus } from "../utils";

interface UseGraphStatusProps {
  apiUrl: string;
  logger: Logger;
}

/**
 * Hook to check graph status and show error if unavailable
 */
export function useGraphStatus({ apiUrl, logger }: UseGraphStatusProps) {
  const threadFetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const currentController = threadFetchControllerRef.current;

    const checkStatus = async () => {
      try {
        const ok = await checkGraphStatus(apiUrl, null, controller.signal);

        if (!controller.signal.aborted && !ok) {
          toast.error("Failed to connect to LangGraph server", {
            description: `Please ensure your graph is running at ${apiUrl} and you are properly authenticated.`,
            duration: 10000,
            richColors: true,
            closeButton: true,
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError") {
          logger.error(error, {
            operation: "check_graph_status",
            additionalData: { apiUrl },
          });
        }
      }
    };

    checkStatus();

    return () => {
      controller.abort();
      if (currentController) {
        currentController.abort();
      }
    };
  }, [apiUrl, logger]);
}
