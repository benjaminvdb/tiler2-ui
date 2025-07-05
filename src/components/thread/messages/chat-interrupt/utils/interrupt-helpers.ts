import { HumanInterrupt } from "@langchain/langgraph/prebuilt";

export function getQuestionText(interrupt: HumanInterrupt): string {
  const { action_request, description } = interrupt;
  return description || `Review action: ${action_request.action}`;
}

export function hasActionArgs(actionRequest: HumanInterrupt["action_request"]): boolean {
  return actionRequest.args && Object.keys(actionRequest.args).length > 0;
}