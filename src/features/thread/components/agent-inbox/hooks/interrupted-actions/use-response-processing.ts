import { HumanResponse } from "@langchain/langgraph/prebuilt";
import { useStreamContext } from "@/core/providers/stream";
import { useLogger } from "@/core/services/logging";

export function useResponseProcessing() {
  const thread = useStreamContext();
  const logger = useLogger();

  const resumeRun = (response: HumanResponse[]): boolean => {
    try {
      thread.submit(
        {},
        {
          command: {
            resume: response,
          },
        },
      );
      return true;
    } catch (e: unknown) {
      logger.error(e instanceof Error ? e : new Error(String(e)), {
        operation: "send_human_response",
        component: "use-response-processing",
      });
      return false;
    }
  };

  return { resumeRun };
}
