import { HumanResponseWithEdits } from "../../../../../types";
import { EditResponseParams } from "../types";

/**
 * Creates a new edit response with updated arguments
 */
export function createEditResponse({
  response,
  change,
  key,
  valuesChanged,
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
