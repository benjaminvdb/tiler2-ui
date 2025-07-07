import { ActionRequest } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits } from "../../../types";

// Types
export interface EditResponseParams {
  response: HumanResponseWithEdits;
  change: string | string[];
  key: string | string[];
  valuesChanged: boolean;
}

export interface UpdateEditResponseParams {
  prev: HumanResponseWithEdits[];
  response: HumanResponseWithEdits;
  newEdit: HumanResponseWithEdits;
  valuesChanged: boolean;
}

export interface StringResponseParams {
  response: HumanResponseWithEdits;
  change: string;
}

export interface UpdateStringResponseParams {
  prev: HumanResponseWithEdits[];
  response: HumanResponseWithEdits;
  newResponse: HumanResponseWithEdits;
  hasContent: boolean;
}

// String Response Functions
/**
 * Creates a new string response
 */
export function createStringResponse({
  response,
  change,
}: StringResponseParams): HumanResponseWithEdits {
  return {
    type: response.type,
    args: change,
  };
}

/**
 * Updates human response array with new string response
 */
export function updateHumanResponseWithString({
  prev,
  response,
  newResponse,
  hasContent,
}: UpdateStringResponseParams): HumanResponseWithEdits[] {
  const existingResponse = prev.find((p) => p.type === response.type);

  if (!existingResponse) {
    throw new Error("No human response found for string response");
  }

  return prev.map((p) => {
    if (p.type === response.type) {
      if (p.acceptAllowed) {
        return {
          ...newResponse,
          acceptAllowed: true,
          editsMade: hasContent,
        };
      }
      return newResponse;
    }
    return p;
  });
}

// Edit Response Functions
/**
 * Creates a new edit response with updated arguments
 */
export function createEditResponse({
  response,
  change,
  key,
  valuesChanged: _valuesChanged,
}: EditResponseParams): HumanResponseWithEdits {
  if (typeof response.args !== "object" || !response.args) {
    throw new Error("Invalid response args for edit");
  }

  return {
    type: response.type,
    args: {
      action: response.args.action,
      args:
        Array.isArray(change) && Array.isArray(key)
          ? {
              ...response.args.args,
              ...Object.fromEntries(key.map((k, i) => [k, change[i]])),
            }
          : {
              ...response.args.args,
              [key as string]: change as string,
            },
    },
  };
}

/**
 * Updates human response array with new edit response
 */
export function updateHumanResponseWithEdit({
  prev,
  response,
  newEdit,
  valuesChanged,
}: UpdateEditResponseParams): HumanResponseWithEdits[] {
  const existingResponse = prev.find(
    (p) =>
      p.type === response.type &&
      typeof p.args === "object" &&
      p.args?.action === (response.args as ActionRequest).action,
  );

  if (!existingResponse) {
    throw new Error("No matching response found");
  }

  return prev.map((p) => {
    if (
      p.type === response.type &&
      typeof p.args === "object" &&
      p.args?.action === (response.args as ActionRequest).action
    ) {
      if (p.acceptAllowed) {
        return {
          ...newEdit,
          acceptAllowed: true,
          editsMade: valuesChanged,
        };
      }
      return newEdit;
    }
    return p;
  });
}
