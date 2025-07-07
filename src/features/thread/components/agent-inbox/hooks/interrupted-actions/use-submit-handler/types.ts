import { KeyboardEvent } from "react";
import { HumanResponseWithEdits, SubmitType } from "../../../types";

export interface UseSubmitHandlerProps {
  humanResponse: HumanResponseWithEdits[];
  selectedSubmitType: SubmitType | undefined;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  setStreamFinished: React.Dispatch<React.SetStateAction<boolean>>;
  initialHumanInterruptEditValue: React.MutableRefObject<
    Record<string, string>
  >;
}

export interface UseSubmitHandlerReturn {
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent,
  ) => Promise<void>;
}

export interface SubmissionContext {
  humanResponse: HumanResponseWithEdits[];
  selectedSubmitType: SubmitType | undefined;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  setStreamFinished: React.Dispatch<React.SetStateAction<boolean>>;
  initialHumanInterruptEditValue: React.MutableRefObject<
    Record<string, string>
  >;
}
