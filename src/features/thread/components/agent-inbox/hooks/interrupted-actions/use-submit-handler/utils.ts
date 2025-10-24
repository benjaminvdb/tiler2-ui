import { toast } from "sonner";
import { HumanResponse } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits, SubmitType } from "../../../types";
import { UseSubmitHandlerProps } from "./types";
import { getLogger } from "@/core/services/logging";

const logger = getLogger().child({
  component: "use-submit-handler-utils",
});

// Validation utilities
export function validateHumanResponse(
  humanResponse: HumanResponseWithEdits[],
): boolean {
  if (!humanResponse) {
    toast.error("Error", {
      description: "Please enter a response.",
      duration: 5000,
      richColors: true,
      closeButton: true,
    });
    return false;
  }
  return true;
}

export function validateSelectedInput(
  humanResponseInput: HumanResponse[],
  selectedSubmitType: SubmitType | undefined,
): HumanResponse | null {
  const input = humanResponseInput.find((r) => r.type === selectedSubmitType);

  if (!input) {
    toast.error("Error", {
      description: "No response found.",
      richColors: true,
      closeButton: true,
      duration: 5000,
    });
    return null;
  }

  return input;
}

// Response transformation utilities
export function transformHumanResponse(
  humanResponse: HumanResponseWithEdits[],
): HumanResponse[] {
  return humanResponse.map((response) => {
    if (response.type === "edit") {
      return {
        type: response.type,
        args: response.args,
      };
    }

    if (response.type === "response") {
      return {
        type: response.type,
        args: response.args,
      };
    }

    return {
      type: response.type,
      args: response.args,
    };
  });
}

// Error handling utilities
export function handleSubmissionError(error: unknown): void {
  logger.error(error instanceof Error ? error : new Error(String(error)), {
    operation: "submit_response",
  });
  toast.error("Error", {
    description: "Failed to submit response. Please try again.",
    duration: 5000,
    richColors: true,
    closeButton: true,
  });
}

export function showSuccessToast(): void {
  toast.success("Success", {
    description: "Response submitted successfully.",
    duration: 3000,
    richColors: true,
    closeButton: true,
  });
}

// State management utilities
type SubmissionContext = Pick<
  UseSubmitHandlerProps,
  | "setLoading"
  | "setStreaming"
  | "setStreamFinished"
  | "humanResponse"
  | "selectedSubmitType"
  | "initialHumanInterruptEditValue"
>;

export function initializeSubmission(context: SubmissionContext): void {
  context.setLoading(true);
  context.setStreaming(true);
  context.setStreamFinished(false);
}

export function handleSubmissionSuccess(context: SubmissionContext): void {
  context.setLoading(false);
  context.setStreaming(false);
}

export function handleSubmissionStateError(context: SubmissionContext): void {
  context.setLoading(false);
  context.setStreaming(false);
  context.setStreamFinished(false);
}

export function handleSimpleSubmission(context: SubmissionContext): void {
  context.setLoading(true);
  context.setStreaming(true);
  context.setStreamFinished(false);
}
