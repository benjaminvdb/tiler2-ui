import { SubmitType } from "../../../types";

/**
 * Determines the appropriate submit type based on current state
 */
export function resolveSubmitType(
  valuesChanged: boolean,
  acceptAllowed: boolean,
  hasAddedResponse: boolean
): SubmitType {
  if (!valuesChanged) {
    if (acceptAllowed) {
      return "accept";
    } else if (hasAddedResponse) {
      return "response";
    }
  }
  return "edit";
}

/**
 * Determines submit type when response changes
 */
export function resolveSubmitTypeForResponse(
  hasContent: boolean,
  hasEdited: boolean,
  acceptAllowed: boolean
): SubmitType | undefined {
  if (!hasContent) {
    if (hasEdited) {
      return "edit";
    } else if (acceptAllowed) {
      return "accept";
    }
    return undefined;
  } else {
    return "response";
  }
}