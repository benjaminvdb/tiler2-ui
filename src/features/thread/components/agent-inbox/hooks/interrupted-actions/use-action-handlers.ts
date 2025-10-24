import { toast } from "sonner";
import { END } from "@langchain/langgraph/web";
import { useStreamContext } from "@/core/providers/stream";
import { HumanResponseWithEdits } from "../../types";
import { useResponseProcessing } from "./use-response-processing";
import { useLogger } from "@/core/services/logging";

interface UseActionHandlersProps {
  humanResponse: HumanResponseWithEdits[];
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  initialHumanInterruptEditValue: React.MutableRefObject<
    Record<string, string>
  >;
}

export function useActionHandlers({
  humanResponse,
  setLoading,
  initialHumanInterruptEditValue,
}: UseActionHandlersProps) {
  const thread = useStreamContext();
  const { resumeRun } = useResponseProcessing();
  const logger = useLogger();

  const handleIgnore = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    const ignoreResponse = humanResponse.find((r) => r.type === "ignore");
    if (!ignoreResponse) {
      toast.error("Error", {
        description: "The selected thread does not support ignoring.",
        duration: 5000,
      });
      return;
    }

    setLoading(true);
    initialHumanInterruptEditValue.current = {};

    resumeRun([ignoreResponse]);

    setLoading(false);
    toast("Successfully ignored thread", {
      duration: 5000,
    });
  };

  const handleResolve = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    setLoading(true);
    initialHumanInterruptEditValue.current = {};

    try {
      thread.submit(
        {},
        {
          command: {
            goto: END,
          },
        },
      );

      toast("Success", {
        description: "Marked thread as resolved.",
        duration: 3000,
      });
    } catch (e) {
      logger.error(e instanceof Error ? e : new Error(String(e)), {
        operation: "mark_thread_resolved",
        component: "use-action-handlers",
      });
      toast.error("Error", {
        description: "Failed to mark thread as resolved.",
        richColors: true,
        closeButton: true,
        duration: 3000,
      });
    }

    setLoading(false);
  };

  return { handleIgnore, handleResolve };
}
