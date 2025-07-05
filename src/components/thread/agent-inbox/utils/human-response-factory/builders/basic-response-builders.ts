import { HumanResponseWithEdits } from "../../../types";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";

export function buildResponseResponse(interrupt: HumanInterrupt): HumanResponseWithEdits | null {
  if (!interrupt.config.allow_respond) {
    return null;
  }
  
  return {
    type: "response",
    args: "",
  };
}

export function buildIgnoreResponse(interrupt: HumanInterrupt): HumanResponseWithEdits | null {
  if (!interrupt.config.allow_ignore) {
    return null;
  }
  
  return {
    type: "ignore",
    args: null,
  };
}

export function buildAcceptResponse(): HumanResponseWithEdits {
  return {
    type: "accept",
    args: null,
  };
}