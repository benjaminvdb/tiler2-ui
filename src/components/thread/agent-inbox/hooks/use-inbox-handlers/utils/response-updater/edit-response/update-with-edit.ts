import { ActionRequest } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits } from "../../../../../types";
import { UpdateEditResponseParams } from "../types";

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
