import { HumanInterrupt } from "@langchain/langgraph/prebuilt";

export const getQuestionText = (interrupt: HumanInterrupt): string => {
  const { action_request, description } = interrupt;
  return description || `Review action: ${action_request.action}`;
};

export const hasActionArgs = (
  actionRequest: HumanInterrupt["action_request"],
): boolean => {
  return actionRequest.args && Object.keys(actionRequest.args).length > 0;
};
