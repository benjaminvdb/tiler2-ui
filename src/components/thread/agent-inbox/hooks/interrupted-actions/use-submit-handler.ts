import { KeyboardEvent } from "react";
import { toast } from "sonner";
import { HumanResponse } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits, SubmitType } from "../../types";
import { useResponseProcessing } from "./use-response-processing";

interface UseSubmitHandlerProps {
  humanResponse: HumanResponseWithEdits[];
  selectedSubmitType: SubmitType | undefined;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  setStreamFinished: React.Dispatch<React.SetStateAction<boolean>>;
  initialHumanInterruptEditValue: React.MutableRefObject<Record<string, string>>;
}

export function useSubmitHandler({
  humanResponse,
  selectedSubmitType,
  setLoading,
  setStreaming,
  setStreamFinished,
  initialHumanInterruptEditValue,
}: UseSubmitHandlerProps) {
  const { resumeRun } = useResponseProcessing();

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent,
  ) => {
    e.preventDefault();
    if (!humanResponse) {
      toast.error("Error", {
        description: "Please enter a response.",
        duration: 5000,
        richColors: true,
        closeButton: true,
      });
      return;
    }

    let errorOccurred = false;
    initialHumanInterruptEditValue.current = {};

    if (
      humanResponse.some((r) => ["response", "edit", "accept"].includes(r.type))
    ) {
      setStreamFinished(false);

      try {
        const humanResponseInput: HumanResponse[] = humanResponse.flatMap(
          (r) => {
            if (r.type === "edit") {
              if (r.acceptAllowed && !r.editsMade) {
                return {
                  type: "accept",
                  args: r.args,
                };
              } else {
                return {
                  type: "edit",
                  args: r.args,
                };
              }
            }

            if (r.type === "response" && !r.args) {
              // If response was allowed but no response was given, do not include in the response
              return [];
            }
            return {
              type: r.type,
              args: r.args,
            };
          },
        );

        const input = humanResponseInput.find(
          (r) => r.type === selectedSubmitType,
        );
        if (!input) {
          toast.error("Error", {
            description: "No response found.",
            richColors: true,
            closeButton: true,
            duration: 5000,
          });
          return;
        }

        setLoading(true);
        setStreaming(true);
        const resumedSuccessfully = resumeRun([input]);
        if (!resumedSuccessfully) {
          // This will only be undefined if the graph ID is not found
          // in this case, the method will trigger a toast for us.
          return;
        }

        toast("Success", {
          description: "Response submitted successfully.",
          duration: 5000,
        });

        if (!errorOccurred) {
          setStreamFinished(true);
        }
      } catch (e: any) {
        console.error("Error sending human response", e);

        if ("message" in e && e.message.includes("Invalid assistant ID")) {
          toast("Error: Invalid assistant ID", {
            description:
              "The provided assistant ID was not found in this graph. Please update the assistant ID in the settings and try again.",
            richColors: true,
            closeButton: true,
            duration: 5000,
          });
        } else {
          toast.error("Error", {
            description: "Failed to submit response.",
            richColors: true,
            closeButton: true,
            duration: 5000,
          });
        }

        errorOccurred = true;
        setStreaming(false);
        setStreamFinished(false);
      }

      if (!errorOccurred) {
        setStreaming(false);
        setStreamFinished(false);
      }
    } else {
      setLoading(true);
      resumeRun(humanResponse);

      toast("Success", {
        description: "Response submitted successfully.",
        duration: 5000,
      });
    }

    setLoading(false);
  };

  return { handleSubmit };
}