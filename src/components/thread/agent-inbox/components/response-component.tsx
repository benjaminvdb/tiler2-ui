import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits } from "../types";
import { ResetButton } from "./shared/reset-button";
import { ArgsRenderer } from "./shared/args-renderer";

interface ResponseComponentProps {
  humanResponse: HumanResponseWithEdits[];
  streaming: boolean;
  showArgsInResponse: boolean;
  interruptValue: HumanInterrupt;
  onResponseChange: (change: string, response: HumanResponseWithEdits) => void;
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent,
  ) => Promise<void>;
}

function ResponseComponent({
  humanResponse,
  streaming,
  showArgsInResponse,
  interruptValue,
  onResponseChange,
  handleSubmit,
}: ResponseComponentProps) {
  const res = humanResponse.find((r) => r.type === "response");
  if (!res || typeof res.args !== "string") {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-4 rounded-xl border-[1px] border-gray-300 p-6">
      <div className="flex w-full items-center justify-between">
        <p className="text-base font-semibold text-black">
          Respond to assistant
        </p>
        <ResetButton
          handleReset={() => {
            onResponseChange("", res);
          }}
        />
      </div>

      {showArgsInResponse && (
        <ArgsRenderer args={interruptValue.action_request.args} />
      )}

      <div className="flex w-full flex-col items-start gap-[6px]">
        <p className="min-w-fit text-sm font-medium">Response</p>
        <Textarea
          disabled={streaming}
          value={res.args}
          onChange={(e) => onResponseChange(e.target.value, res)}
          onKeyDown={handleKeyDown}
          rows={4}
          placeholder="Your response here..."
        />
      </div>

      <div className="flex w-full items-center justify-end gap-2">
        <Button
          variant="brand"
          disabled={streaming}
          onClick={handleSubmit}
        >
          Send Response
        </Button>
      </div>
    </div>
  );
}

export const Response = React.memo(ResponseComponent);