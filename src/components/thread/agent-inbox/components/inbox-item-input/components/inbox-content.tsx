import { HumanResponseWithEdits } from "../../../types";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { EditAndOrAcceptComponent } from "../../edit-and-accept";
import { Response } from "../../response-component";
import { Separator } from "@/components/ui/separator";

interface MethodSeparatorProps {
  supportsMultipleMethods: boolean;
}

function MethodSeparator({ supportsMultipleMethods }: MethodSeparatorProps) {
  if (!supportsMultipleMethods) {
    return null;
  }

  return (
    <div className="mx-auto mt-3 flex items-center gap-3">
      <Separator className="w-[full]" />
      <p className="text-sm text-gray-500">Or</p>
      <Separator className="w-full" />
    </div>
  );
}

interface StatusIndicatorProps {
  streaming: boolean;
  streamFinished: boolean;
}

function StatusIndicator({ streaming, streamFinished }: StatusIndicatorProps) {
  if (streaming) {
    return <p className="text-sm text-gray-600">Running...</p>;
  }

  if (streamFinished) {
    return (
      <p className="text-base font-medium text-green-600">
        Successfully finished Graph invocation.
      </p>
    );
  }

  return null;
}

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
