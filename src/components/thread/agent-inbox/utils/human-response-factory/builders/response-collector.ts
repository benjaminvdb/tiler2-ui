import { HumanResponseWithEdits } from "../../../types";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { buildEditResponse } from "./edit-response-builder";
import { buildResponseResponse, buildIgnoreResponse, buildAcceptResponse } from "./basic-response-builders";

export function collectResponses(
  interrupt: HumanInterrupt,
  initialHumanInterruptEditValue: React.MutableRefObject<Record<string, string>>
): HumanResponseWithEdits[] {
  const responses: HumanResponseWithEdits[] = [];

  // Add edit response if allowed
  const editResponse = buildEditResponse(interrupt, initialHumanInterruptEditValue);
  if (editResponse) {
    responses.push(editResponse);
  }

  // Add response response if allowed
  const responseResponse = buildResponseResponse(interrupt);
  if (responseResponse) {
    responses.push(responseResponse);
  }

  // Add ignore response if allowed
  const ignoreResponse = buildIgnoreResponse(interrupt);
  if (ignoreResponse) {
    responses.push(ignoreResponse);
  }

  // Add accept response if allowed and not already present
  if (interrupt.config.allow_accept && !responses.find((r) => r.type === "accept")) {
    responses.push(buildAcceptResponse());
  }

  // Add ignore response if allowed and not already present
  if (interrupt.config.allow_ignore && !responses.find((r) => r.type === "ignore")) {
    responses.push(buildIgnoreResponse(interrupt)!);
  }

  return responses;
}