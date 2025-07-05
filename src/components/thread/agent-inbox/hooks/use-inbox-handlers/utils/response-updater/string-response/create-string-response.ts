import { HumanResponseWithEdits } from "../../../../../types";
import { StringResponseParams } from "../types";

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