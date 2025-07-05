import { HumanResponseWithEdits, SubmitType } from "../../../types";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";

export function calculateDefaultSubmitType(
  responses: HumanResponseWithEdits[],
  interrupt: HumanInterrupt
): { defaultSubmitType: SubmitType | undefined; hasAccept: boolean } {
  const acceptAllowedConfig = interrupt.config.allow_accept;
  
  const hasResponse = responses.find((r) => r.type === "response");
  const hasAccept = responses.find((r) => r.acceptAllowed) || acceptAllowedConfig;
  const hasEdit = responses.find((r) => r.type === "edit");

  let defaultSubmitType: SubmitType | undefined;
  if (hasAccept) {
    defaultSubmitType = "accept";
  } else if (hasResponse) {
    defaultSubmitType = "response";
  } else if (hasEdit) {
    defaultSubmitType = "edit";
  }

  return { defaultSubmitType, hasAccept: !!hasAccept };
}