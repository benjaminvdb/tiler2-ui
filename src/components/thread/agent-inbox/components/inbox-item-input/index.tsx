import React from "react";
import { HumanResponseWithEdits, SubmitType } from "../../types";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { ArgsRenderer } from "../shared/args-renderer";
import { useInboxHandlers } from "../../hooks/use-inbox-handlers";
import { useInboxConfig } from "../../hooks/use-inbox-config";
import { InboxContent } from "./components";

interface InboxItemInputProps {
  interruptValue: HumanInterrupt;
  humanResponse: HumanResponseWithEdits[];
  supportsMultipleMethods: boolean;
  acceptAllowed: boolean;
  hasEdited: boolean;
  hasAddedResponse: boolean;
  initialValues: Record<string, string>;
  streaming: boolean;
  streamFinished: boolean;
  setHumanResponse: React.Dispatch<
    React.SetStateAction<HumanResponseWithEdits[]>
  >;
  setSelectedSubmitType: React.Dispatch<
    React.SetStateAction<SubmitType | undefined>
  >;
  setHasAddedResponse: React.Dispatch<React.SetStateAction<boolean>>;
  setHasEdited: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent,
  ) => Promise<void>;
}

export function InboxItemInput({
  interruptValue,
  humanResponse,
  streaming,
  streamFinished,
  supportsMultipleMethods,
  acceptAllowed,
  hasEdited,
  hasAddedResponse,
  initialValues,
  setHumanResponse,
  setSelectedSubmitType,
  setHasEdited,
  setHasAddedResponse,
  handleSubmit,
}: InboxItemInputProps) {
  const { showArgsInResponse, showArgsOutsideActionCards } = useInboxConfig({
    interruptValue,
    acceptAllowed,
  });

  const { onEditChange, onResponseChange } = useInboxHandlers({
    acceptAllowed,
    hasEdited,
    hasAddedResponse,
    initialValues,
    setHumanResponse,
    setSelectedSubmitType,
    setHasEdited,
    setHasAddedResponse,
  });

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2">
      {showArgsOutsideActionCards && (
        <ArgsRenderer args={interruptValue.action_request.args} />
      )}
      <InboxContent
        humanResponse={humanResponse}
        streaming={streaming}
        streamFinished={streamFinished}
        supportsMultipleMethods={supportsMultipleMethods}
        initialValues={initialValues}
        interruptValue={interruptValue}
        showArgsInResponse={showArgsInResponse}
        onEditChange={onEditChange}
        onResponseChange={onResponseChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
