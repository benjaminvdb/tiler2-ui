import { HumanResponseWithEdits } from "../../../types";

export function getButtonText(editResponse: HumanResponseWithEdits): string {
  let buttonText = "Submit";
  if (editResponse.acceptAllowed && !editResponse.editsMade) {
    buttonText = "Accept";
  }
  return buttonText;
}

export function getHeaderText(editResponse: HumanResponseWithEdits): string {
  return editResponse.acceptAllowed ? "Edit/Accept" : "Edit";
}
