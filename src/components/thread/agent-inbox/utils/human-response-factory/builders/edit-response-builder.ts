import { HumanResponseWithEdits } from "../../../types";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { validateAndUpdateEditValue } from "../validators/edit-value-validator";

export function buildEditResponse(
  interrupt: HumanInterrupt,
  initialHumanInterruptEditValue: React.MutableRefObject<Record<string, string>>
): HumanResponseWithEdits | null {
  if (!interrupt.config.allow_edit) {
    return null;
  }

  if (interrupt.config.allow_accept) {
    Object.entries(interrupt.action_request.args).forEach(([k, v]) => {
      validateAndUpdateEditValue(k, v, initialHumanInterruptEditValue);
    });
    
    return {
      type: "edit",
      args: interrupt.action_request,
      acceptAllowed: true,
      editsMade: false,
    };
  } else {
    return {
      type: "edit",
      args: interrupt.action_request,
      acceptAllowed: false,
    };
  }
}