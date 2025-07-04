import React from "react";
import { Separator } from "@/components/ui/separator";
import { HumanResponseWithEdits, SubmitType } from "../types";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { ArgsRenderer } from "./shared/args-renderer";
import { Response } from "./response-component";
import { EditAndOrAccept } from "./edit-and-accept-component";
import { useInboxHandlers } from "../hooks/use-inbox-handlers";
import { useInboxConfig } from "../hooks/use-inbox-config";

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
  const {
    showArgsInResponse,
    showArgsOutsideActionCards,
  } = useInboxConfig({ interruptValue, acceptAllowed });

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

      <div className="flex w-full flex-col items-start gap-2">
        <EditAndOrAccept
          humanResponse={humanResponse}
          streaming={streaming}
          initialValues={initialValues}
          interruptValue={interruptValue}
          onEditChange={onEditChange}
          handleSubmit={handleSubmit}
        />
        {supportsMultipleMethods ? (
          <div className="mx-auto mt-3 flex items-center gap-3">
            <Separator className="w-[full]" />
            <p className="text-sm text-gray-500">Or</p>
            <Separator className="w-full" />
          </div>
        ) : null}
        <Response
          humanResponse={humanResponse}
          streaming={streaming}
          showArgsInResponse={showArgsInResponse}
          interruptValue={interruptValue}
          onResponseChange={onResponseChange}
          handleSubmit={handleSubmit}
        />
        {streaming && <p className="text-sm text-gray-600">Running...</p>}
        {streamFinished && (
          <p className="text-base font-medium text-green-600">
            Successfully finished Graph invocation.
          </p>
        )}
      </div>
    </div>
  );
}
