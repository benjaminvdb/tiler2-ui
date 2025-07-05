import { HumanResponseWithEdits } from "../../../../types";

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
