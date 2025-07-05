import { HumanResponseWithEdits } from "../../../types";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { EditAndOrAcceptComponent } from "../../edit-and-accept-component";
import { Response } from "../../response-component";
import { MethodSeparator } from "./method-separator";
import { StatusIndicator } from "./status-indicator";

interface InboxContentProps {
  humanResponse: HumanResponseWithEdits[];
  streaming: boolean;
  streamFinished: boolean;
  supportsMultipleMethods: boolean;
  initialValues: Record<string, string>;
  interruptValue: HumanInterrupt;
  showArgsInResponse: boolean;
  onEditChange: (
    text: string | string[],
    response: HumanResponseWithEdits,
    key: string | string[],
  ) => void;
  onResponseChange: (change: string, response: HumanResponseWithEdits) => void;
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent,
  ) => Promise<void>;
}

export function InboxContent({
  humanResponse,
  streaming,
  streamFinished,
  supportsMultipleMethods,
  initialValues,
  interruptValue,
  showArgsInResponse,
  onEditChange,
  onResponseChange,
  handleSubmit,
}: InboxContentProps) {
  return (
    <div className="flex w-full flex-col items-start gap-2">
      <EditAndOrAcceptComponent
        humanResponse={humanResponse}
        streaming={streaming}
        initialValues={initialValues}
        interruptValue={interruptValue}
        onEditChange={onEditChange}
        handleSubmit={handleSubmit}
      />
      <MethodSeparator supportsMultipleMethods={supportsMultipleMethods} />
      <Response
        humanResponse={humanResponse}
        streaming={streaming}
        showArgsInResponse={showArgsInResponse}
        interruptValue={interruptValue}
        onResponseChange={onResponseChange}
        handleSubmit={handleSubmit}
      />
      <StatusIndicator
        streaming={streaming}
        streamFinished={streamFinished}
      />
    </div>
  );
}
