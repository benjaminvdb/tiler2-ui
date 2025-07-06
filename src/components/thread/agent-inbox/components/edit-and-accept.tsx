import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits } from "../types";
import { FieldValue } from "@/types";
import { AcceptComponent } from "./accept-component";
import { ResetButton } from "./shared/reset-button";
import { prettifyText } from "../utils";

// Types
export interface EditAndOrAcceptComponentProps {
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

// Utility functions
const getButtonText = (editResponse: HumanResponseWithEdits): string => {
  let buttonText = "Submit";
  if (editResponse.acceptAllowed && !editResponse.editsMade) {
    buttonText = "Accept";
  }
  return buttonText;
};

const getHeaderText = (editResponse: HumanResponseWithEdits): string => {
  return editResponse.acceptAllowed ? "Edit/Accept" : "Edit";
};

const calculateDefaultRows = (
  value: FieldValue,
  fieldKey: string,
  defaultRows: React.MutableRefObject<Record<string, number>>,
): number => {
  if (defaultRows.current[fieldKey] === undefined) {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    defaultRows.current[fieldKey] = !stringValue.length
      ? 3
      : Math.max(stringValue.length / 30, 7);
  }
  return defaultRows.current[fieldKey] || 8;
};

const formatFieldValue = (value: FieldValue): string => {
  return ["string", "number"].includes(typeof value)
    ? String(value)
    : JSON.stringify(value, null);
};

// Hooks
function useEditResponse(humanResponse: HumanResponseWithEdits[]) {
  const editResponse = humanResponse.find((r) => r.type === "edit");
  const acceptResponse = humanResponse.find((r) => r.type === "accept");

  const isValidEditResponse =
    editResponse && typeof editResponse.args === "object" && editResponse.args;

  return {
    editResponse,
    acceptResponse,
    isValidEditResponse,
  };
}

function useResetHandler(
  editResponse: HumanResponseWithEdits | undefined,
  initialValues: Record<string, string>,
  onEditChange: (
    text: string | string[],
    response: HumanResponseWithEdits,
    key: string | string[],
  ) => void,
) {
  const handleReset = () => {
    if (
      !editResponse ||
      typeof editResponse.args !== "object" ||
      !editResponse.args ||
      !editResponse.args.args
    ) {
      return;
    }

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

  return { handleReset };
}

function useKeyboardHandler(
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent,
  ) => Promise<void>,
) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return { handleKeyDown };
}

// Sub-components
function Header({ title, onReset }: { title: string; onReset: () => void }) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-base font-semibold text-black">{title}</p>
      <ResetButton handleReset={onReset} />
    </div>
  );
}

function FormField({
  fieldKey,
  value,
  editResponse,
  streaming,
  defaultRows,
  onEditChange,
  onKeyDown,
  index,
}: {
  fieldKey: string;
  value: FieldValue;
  editResponse: HumanResponseWithEdits;
  streaming: boolean;
  defaultRows: React.MutableRefObject<Record<string, number>>;
  onEditChange: (
    text: string | string[],
    response: HumanResponseWithEdits,
    key: string | string[],
  ) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  index: number;
}) {
  const formattedValue = formatFieldValue(value);
  const numRows = calculateDefaultRows(value, fieldKey, defaultRows);

  return (
    <div
      className="flex h-full w-full flex-col items-start gap-1 px-[1px]"
      key={`allow-edit-args--${fieldKey}-${index}`}
    >
      <div className="flex w-full flex-col items-start gap-[6px]">
        <p className="min-w-fit text-sm font-medium">
          {prettifyText(fieldKey)}
        </p>
        <Textarea
          disabled={streaming}
          className="h-full"
          value={formattedValue}
          onChange={(e) => onEditChange(e.target.value, editResponse, fieldKey)}
          onKeyDown={onKeyDown}
          rows={numRows}
        />
      </div>
    </div>
  );
}

function SubmitButton({
  buttonText,
  streaming,
  onSubmit,
}: {
  buttonText: string;
  streaming: boolean;
  onSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent,
  ) => Promise<void>;
}) {
  return (
    <div className="flex w-full items-center justify-end gap-2">
      <Button
        variant="brand"
        disabled={streaming}
        onClick={onSubmit}
      >
        {buttonText}
      </Button>
    </div>
  );
}

// Main component
function EditAndOrAcceptComponent({
  humanResponse,
  streaming,
  initialValues,
  interruptValue,
  onEditChange,
  handleSubmit,
}: EditAndOrAcceptComponentProps) {
  const defaultRows = React.useRef<Record<string, number>>({});
  const { editResponse, acceptResponse, isValidEditResponse } =
    useEditResponse(humanResponse);
  const { handleReset } = useResetHandler(
    editResponse,
    initialValues,
    onEditChange,
  );
  const { handleKeyDown } = useKeyboardHandler(handleSubmit);

  if (!isValidEditResponse || !editResponse) {
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

  const headerText = getHeaderText(editResponse);
  const buttonText = getButtonText(editResponse);

  return (
    <div className="flex w-full flex-col items-start gap-4 rounded-lg border-[1px] border-gray-300 p-6">
      <Header
        title={headerText}
        onReset={handleReset}
      />

      {editResponse.args &&
        typeof editResponse.args === "object" &&
        (editResponse.args as Record<string, any>).args &&
        Object.entries((editResponse.args as Record<string, any>).args).map(([k, v], idx) => (
          <FormField
            key={`allow-edit-args--${k}-${idx}`}
            fieldKey={k}
            value={v as FieldValue}
            editResponse={editResponse}
            streaming={streaming}
            defaultRows={defaultRows}
            onEditChange={onEditChange}
            onKeyDown={handleKeyDown}
            index={idx}
          />
        ))}

      <SubmitButton
        buttonText={buttonText}
        streaming={streaming}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export { EditAndOrAcceptComponent };
