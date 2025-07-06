import { HumanInterrupt } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits, SubmitType } from "../types";

// Types
export interface HumanResponseFactoryResult {
  responses: HumanResponseWithEdits[];
  defaultSubmitType: SubmitType | undefined;
  hasAccept: boolean;
}

export interface EditValueRef {
  current: Record<string, string>;
}

export interface ResponseBuilderParams {
  interrupt: HumanInterrupt;
  initialHumanInterruptEditValue: React.MutableRefObject<
    Record<string, string>
  >;
}

// Validator functions
function validateAndUpdateEditValue(
  key: string,
  value: unknown,
  initialHumanInterruptEditValue: React.MutableRefObject<
    Record<string, string>
  >,
): void {
  let stringValue = "";
  if (typeof value === "string") {
    stringValue = value;
  } else {
    stringValue = JSON.stringify(value, null);
  }

  if (
    !initialHumanInterruptEditValue.current ||
    !(key in initialHumanInterruptEditValue.current)
  ) {
    initialHumanInterruptEditValue.current = {
      ...initialHumanInterruptEditValue.current,
      [key]: stringValue,
    };
  } else if (
    key in initialHumanInterruptEditValue.current &&
    initialHumanInterruptEditValue.current[key] !== stringValue
  ) {
    console.error(
      "KEY AND VALUE FOUND IN initialHumanInterruptEditValue.current THAT DOES NOT MATCH THE ACTION REQUEST",
      {
        key: key,
        value: stringValue,
        expectedValue: initialHumanInterruptEditValue.current[key],
      },
    );
  }
}

// Response builder functions
function buildResponseResponse(
  interrupt: HumanInterrupt,
): HumanResponseWithEdits | null {
  if (!interrupt.config.allow_respond) {
    return null;
  }

  return {
    type: "response",
    args: "",
  };
}

function buildIgnoreResponse(
  interrupt: HumanInterrupt,
): HumanResponseWithEdits | null {
  if (!interrupt.config.allow_ignore) {
    return null;
  }

  return {
    type: "ignore",
    args: null,
  };
}

function buildAcceptResponse(): HumanResponseWithEdits {
  return {
    type: "accept",
    args: null,
  };
}

function buildEditResponse(
  interrupt: HumanInterrupt,
  initialHumanInterruptEditValue: React.MutableRefObject<
    Record<string, string>
  >,
): HumanResponseWithEdits | null {
  if (!interrupt.config.allow_edit) {
    return null;
  }

  if (interrupt.config.allow_accept) {
    Object.entries(interrupt.action_request.args).forEach(([k, v]) => {
      validateAndUpdateEditValue(k, v, initialHumanInterruptEditValue);
    });

    return {
      type: "edit",
      args: interrupt.action_request,
      acceptAllowed: true,
      editsMade: false,
    };
  } else {
    return {
      type: "edit",
      args: interrupt.action_request,
      acceptAllowed: false,
    };
  }
}

// Response collector
function collectResponses(
  interrupt: HumanInterrupt,
  initialHumanInterruptEditValue: React.MutableRefObject<
    Record<string, string>
  >,
): HumanResponseWithEdits[] {
  const responses: HumanResponseWithEdits[] = [];

  // Add edit response if allowed
  const editResponse = buildEditResponse(
    interrupt,
    initialHumanInterruptEditValue,
  );
  if (editResponse) {
    responses.push(editResponse);
  }

  // Add response response if allowed
  const responseResponse = buildResponseResponse(interrupt);
  if (responseResponse) {
    responses.push(responseResponse);
  }

  // Add ignore response if allowed
  const ignoreResponse = buildIgnoreResponse(interrupt);
  if (ignoreResponse) {
    responses.push(ignoreResponse);
  }

  // Add accept response if allowed and not already present
  if (
    interrupt.config.allow_accept &&
    !responses.find((r) => r.type === "accept")
  ) {
    responses.push(buildAcceptResponse());
  }

  // Add ignore response if allowed and not already present
  if (
    interrupt.config.allow_ignore &&
    !responses.find((r) => r.type === "ignore")
  ) {
    responses.push(buildIgnoreResponse(interrupt)!);
  }

  return responses;
}

// Submit type calculator
function calculateDefaultSubmitType(
  responses: HumanResponseWithEdits[],
  interrupt: HumanInterrupt,
): { defaultSubmitType: SubmitType | undefined; hasAccept: boolean } {
  const acceptAllowedConfig = interrupt.config.allow_accept;

  const hasResponse = responses.find((r) => r.type === "response");
  const hasAccept =
    responses.find((r) => r.acceptAllowed) || acceptAllowedConfig;
  const hasEdit = responses.find((r) => r.type === "edit");

  let defaultSubmitType: SubmitType | undefined;
  if (hasAccept) {
    defaultSubmitType = "accept";
  } else if (hasResponse) {
    defaultSubmitType = "response";
  } else if (hasEdit) {
    defaultSubmitType = "edit";
  }

  return { defaultSubmitType, hasAccept: !!hasAccept };
}

// Main factory function
export const createDefaultHumanResponse = (
  interrupt: HumanInterrupt,
  initialHumanInterruptEditValue: React.MutableRefObject<
    Record<string, string>
  >,
): HumanResponseFactoryResult => {
  const responses = collectResponses(interrupt, initialHumanInterruptEditValue);
  const { defaultSubmitType, hasAccept } = calculateDefaultSubmitType(
    responses,
    interrupt,
  );

  return { responses, defaultSubmitType, hasAccept };
};