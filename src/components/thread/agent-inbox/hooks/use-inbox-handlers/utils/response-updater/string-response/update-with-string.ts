import { HumanResponseWithEdits } from "../../../../../types";
import { UpdateStringResponseParams } from "../types";

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
