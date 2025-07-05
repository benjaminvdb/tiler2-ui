import { HumanResponseWithEdits, SubmitType } from "../../types";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";

export interface HumanResponseFactoryResult {
  responses: HumanResponseWithEdits[];
  defaultSubmitType: SubmitType | undefined;
  hasAccept: boolean;
}

export interface EditValueRef {
  current: Record<string, string>;
}

export interface ResponseBuilderParams {
  interrupt: HumanInterrupt;
  initialHumanInterruptEditValue: React.MutableRefObject<
    Record<string, string>
  >;
}
