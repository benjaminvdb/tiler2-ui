import React from "react";
import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits } from "../../types";
import { FieldValue } from "@/types";

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

export interface HeaderProps {
  title: string;
  onReset: () => void;
}

export interface FormFieldProps {
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
}

export interface SubmitButtonProps {
  buttonText: string;
  streaming: boolean;
  onSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent,
  ) => Promise<void>;
}
