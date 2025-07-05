import { HumanInterrupt } from "@langchain/langgraph/prebuilt";

interface UseInboxConfigProps {
  interruptValue: HumanInterrupt;
  acceptAllowed: boolean;
}

export function useInboxConfig({
  interruptValue,
  acceptAllowed,
}: UseInboxConfigProps) {
  const isEditAllowed = interruptValue.config.allow_edit;
  const isResponseAllowed = interruptValue.config.allow_respond;
  const hasArgs = Object.entries(interruptValue.action_request.args).length > 0;

  const showArgsInResponse =
    hasArgs && !isEditAllowed && !acceptAllowed && isResponseAllowed;
  const showArgsOutsideActionCards =
    hasArgs && !showArgsInResponse && !isEditAllowed && !acceptAllowed;

  return {
    isEditAllowed,
    isResponseAllowed,
    hasArgs,
    showArgsInResponse,
    showArgsOutsideActionCards,
  };
}
