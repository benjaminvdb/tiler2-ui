import { KeyboardEvent } from "react";
import { useResponseProcessing } from "../use-response-processing";
import { UseSubmitHandlerProps, UseSubmitHandlerReturn } from "./types";
import {
  validateHumanResponse,
  validateSelectedInput,
  transformHumanResponse,
  handleSubmissionError,
  showSuccessToast,
  initializeSubmission,
  handleSubmissionSuccess,
  handleSubmissionStateError as handleStateError,
  handleSimpleSubmission,
} from "./utils";

export function useSubmitHandler({
  humanResponse,
  selectedSubmitType,
  setLoading,
  setStreaming,
  setStreamFinished,
  initialHumanInterruptEditValue,
}: UseSubmitHandlerProps): UseSubmitHandlerReturn {
  const { resumeRun } = useResponseProcessing();

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent,
  ) => {
    e.preventDefault();

    if (!validateHumanResponse(humanResponse)) {
      return;
    }

    const context = {
      humanResponse,
      selectedSubmitType,
      setLoading,
      setStreaming,
      setStreamFinished,
      initialHumanInterruptEditValue,
    };

    let errorOccurred = false;

    if (
      humanResponse.some((r) => ["response", "edit", "accept"].includes(r.type))
    ) {
      initializeSubmission(context);

      try {
        const humanResponseInput = transformHumanResponse(humanResponse);
        const input = validateSelectedInput(
          humanResponseInput,
          selectedSubmitType,
        );

        if (!input) {
          return;
        }

        const resumedSuccessfully = resumeRun([input]);
        if (!resumedSuccessfully) {
          // This will only be undefined if the graph ID is not found
          // in this case, the method will trigger a toast for us.
          return;
        }

        showSuccessToast();

        if (!errorOccurred) {
          setStreamFinished(true);
        }
      } catch (e: unknown) {
        handleSubmissionError(e);
        errorOccurred = true;
        handleStateError(context);
      }

      if (!errorOccurred) {
        handleSubmissionSuccess(context);
      }
    } else {
      handleSimpleSubmission(context);
      resumeRun(humanResponse);
      showSuccessToast();
    }

    setLoading(false);
  };

  return { handleSubmit };
}
