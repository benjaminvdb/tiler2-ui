import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits } from "../types";
import { prettifyText } from "../utils";
import { ResetButton } from "./shared/reset-button";
import { AcceptComponent } from "./accept-component";

interface EditAndOrAcceptComponentProps {
  humanResponse: HumanResponseWithEdits[];
  streaming: boolean;
  initialValues: Record<string, string>;
  interruptValue: HumanInterrupt;
  onEditChange: (
    text: string | string[],
    response: HumanResponseWithEdits,
    key: string | string[],
  ) => void;
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent,
  ) => Promise<void>;
}

function EditAndOrAcceptComponent({
  humanResponse,
  streaming,
  initialValues,
  interruptValue,
  onEditChange,
  handleSubmit,
}: EditAndOrAcceptComponentProps) {
  const defaultRows = React.useRef<Record<string, number>>({});
  const editResponse = humanResponse.find((r) => r.type === "edit");
  const acceptResponse = humanResponse.find((r) => r.type === "accept");
  
  if (
    !editResponse ||
    typeof editResponse.args !== "object" ||
    !editResponse.args
  ) {
    if (acceptResponse) {
      return (
        <AcceptComponent
          actionRequestArgs={interruptValue.action_request.args}
          streaming={streaming}
          handleSubmit={handleSubmit}
        />
      );
    }
    return null;
  }
  
  const header = editResponse.acceptAllowed ? "Edit/Accept" : "Edit";
  let buttonText = "Submit";
  if (editResponse.acceptAllowed && !editResponse.editsMade) {
    buttonText = "Accept";
  }

  const handleReset = () => {
    if (
      !editResponse ||
      typeof editResponse.args !== "object" ||
      !editResponse.args ||
      !editResponse.args.args
    ) {
      return;
    }
    // use initialValues to reset the text areas
    const keysToReset: string[] = [];
    const valuesToReset: string[] = [];
    Object.entries(initialValues).forEach(([k, v]) => {
      if (k in (editResponse.args as Record<string, any>).args) {
        const value = ["string", "number"].includes(typeof v)
          ? v
          : JSON.stringify(v, null);
        keysToReset.push(k);
        valuesToReset.push(value);
      }
    });

    if (keysToReset.length > 0 && valuesToReset.length > 0) {
      onEditChange(valuesToReset, editResponse, keysToReset);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-4 rounded-lg border-[1px] border-gray-300 p-6">
      <div className="flex w-full items-center justify-between">
        <p className="text-base font-semibold text-black">{header}</p>
        <ResetButton handleReset={handleReset} />
      </div>

      {Object.entries(editResponse.args.args).map(([k, v], idx) => {
        const value = ["string", "number"].includes(typeof v)
          ? v
          : JSON.stringify(v, null);
        // Calculate the default number of rows by the total length of the initial value divided by 30
        // or 8, whichever is greater. Stored in a ref to prevent re-rendering.
        if (
          defaultRows.current[k as keyof typeof defaultRows.current] ===
          undefined
        ) {
          defaultRows.current[k as keyof typeof defaultRows.current] = !v.length
            ? 3
            : Math.max(v.length / 30, 7);
        }
        const numRows =
          defaultRows.current[k as keyof typeof defaultRows.current] || 8;

        return (
          <div
            className="flex h-full w-full flex-col items-start gap-1 px-[1px]"
            key={`allow-edit-args--${k}-${idx}`}
          >
            <div className="flex w-full flex-col items-start gap-[6px]">
              <p className="min-w-fit text-sm font-medium">{prettifyText(k)}</p>
              <Textarea
                disabled={streaming}
                className="h-full"
                value={value}
                onChange={(e) => onEditChange(e.target.value, editResponse, k)}
                onKeyDown={handleKeyDown}
                rows={numRows}
              />
            </div>
          </div>
        );
      })}

      <div className="flex w-full items-center justify-end gap-2">
        <Button
          variant="brand"
          disabled={streaming}
          onClick={handleSubmit}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

export const EditAndOrAccept = React.memo(EditAndOrAcceptComponent);