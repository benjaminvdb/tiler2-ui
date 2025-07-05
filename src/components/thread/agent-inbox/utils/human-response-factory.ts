import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { HumanResponseFactoryResult } from "./human-response-factory/types";
import { collectResponses } from "./human-response-factory/builders/response-collector";
import { calculateDefaultSubmitType } from "./human-response-factory/builders/submit-type-calculator";

export function createDefaultHumanResponse(
  interrupt: HumanInterrupt,
  initialHumanInterruptEditValue: React.MutableRefObject<Record<string, string>>
): HumanResponseFactoryResult {
  const responses = collectResponses(interrupt, initialHumanInterruptEditValue);
  const { defaultSubmitType, hasAccept } = calculateDefaultSubmitType(responses, interrupt);

  return { responses, defaultSubmitType, hasAccept };
}