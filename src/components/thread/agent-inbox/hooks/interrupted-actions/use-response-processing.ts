import { HumanResponse } from "@langchain/langgraph/prebuilt";
import { useStreamContext } from "@/providers/stream";

export function useResponseProcessing() {
  const thread = useStreamContext();

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
    } catch (e: any) {
      console.error("Error sending human response", e);
      return false;
    }
  };

  return { resumeRun };
}
