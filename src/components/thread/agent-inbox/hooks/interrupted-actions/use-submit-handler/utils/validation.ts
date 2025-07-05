import { toast } from "sonner";
import { HumanResponse } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits, SubmitType } from "../../../../types";

export function validateHumanResponse(humanResponse: HumanResponseWithEdits[]): boolean {
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
    return null;
  }
  
  return input;
}