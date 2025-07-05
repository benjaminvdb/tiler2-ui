import { HumanResponseWithEdits } from "../../../types";

export function useEditResponse(humanResponse: HumanResponseWithEdits[]) {
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
