import { HumanResponseWithEdits, SubmitType } from "../types";
import {
  KeyboardEvent,
  Dispatch,
  SetStateAction,
  MutableRefObject,
} from "react";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { useInterruptState } from "./interrupted-actions/use-interrupt-state";
import { useSubmitHandler } from "./interrupted-actions/use-submit-handler";
import { useActionHandlers } from "./interrupted-actions/use-action-handlers";

interface UseInterruptedActionsInput {
  interrupt: HumanInterrupt;
}

interface UseInterruptedActionsValue {
  // Actions
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent,
  ) => Promise<void>;
  handleIgnore: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  handleResolve: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;

  // State values
  streaming: boolean;
  streamFinished: boolean;
  loading: boolean;
  supportsMultipleMethods: boolean;
  hasEdited: boolean;
  hasAddedResponse: boolean;
  acceptAllowed: boolean;
  humanResponse: HumanResponseWithEdits[];

  // State setters
  setSelectedSubmitType: Dispatch<SetStateAction<SubmitType | undefined>>;
  setHumanResponse: Dispatch<SetStateAction<HumanResponseWithEdits[]>>;
  setHasAddedResponse: Dispatch<SetStateAction<boolean>>;
  setHasEdited: Dispatch<SetStateAction<boolean>>;

  // Refs
  initialHumanInterruptEditValue: MutableRefObject<Record<string, string>>;
}

export function useInterruptedActions({
  interrupt,
}: UseInterruptedActionsInput): UseInterruptedActionsValue {
  const state = useInterruptState(interrupt);

  const { handleSubmit } = useSubmitHandler({
    humanResponse: state.humanResponse,
    selectedSubmitType: state.selectedSubmitType,
    setLoading: state.setLoading,
    setStreaming: state.setStreaming,
    setStreamFinished: state.setStreamFinished,
    initialHumanInterruptEditValue: state.initialHumanInterruptEditValue,
  });

  const { handleIgnore, handleResolve } = useActionHandlers({
    humanResponse: state.humanResponse,
    setLoading: state.setLoading,
    initialHumanInterruptEditValue: state.initialHumanInterruptEditValue,
  });

  return {
    handleSubmit,
    handleIgnore,
    handleResolve,
    humanResponse: state.humanResponse,
    streaming: state.streaming,
    streamFinished: state.streamFinished,
    loading: state.loading,
    supportsMultipleMethods: state.supportsMultipleMethods,
    hasEdited: state.hasEdited,
    hasAddedResponse: state.hasAddedResponse,
    acceptAllowed: state.acceptAllowed,
    setSelectedSubmitType: state.setSelectedSubmitType,
    setHumanResponse: state.setHumanResponse,
    setHasAddedResponse: state.setHasAddedResponse,
    setHasEdited: state.setHasEdited,
    initialHumanInterruptEditValue: state.initialHumanInterruptEditValue,
  };
}
