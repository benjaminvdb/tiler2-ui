import { HumanResponseWithEdits } from "../../../types";

export const getButtonText = (editResponse: HumanResponseWithEdits): string => {
  let buttonText = "Submit";
  if (editResponse.acceptAllowed && !editResponse.editsMade) {
    buttonText = "Accept";
  }
  return buttonText;
};

export const getHeaderText = (editResponse: HumanResponseWithEdits): string => {
  return editResponse.acceptAllowed ? "Edit/Accept" : "Edit";
};
