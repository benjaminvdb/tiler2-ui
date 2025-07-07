import { HumanResponseWithEdits, SubmitType } from "../../types";

export interface UseInboxHandlersProps {
  acceptAllowed: boolean;
  hasEdited: boolean;
  hasAddedResponse: boolean;
  initialValues: Record<string, string>;
  setHumanResponse: React.Dispatch<
    React.SetStateAction<HumanResponseWithEdits[]>
  >;
  setSelectedSubmitType: React.Dispatch<
    React.SetStateAction<SubmitType | undefined>
  >;
  setHasEdited: React.Dispatch<React.SetStateAction<boolean>>;
  setHasAddedResponse: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface EditChangeHandlerProps {
  acceptAllowed: boolean;
  hasAddedResponse: boolean;
  initialValues: Record<string, string>;
  setHumanResponse: React.Dispatch<
    React.SetStateAction<HumanResponseWithEdits[]>
  >;
  setSelectedSubmitType: React.Dispatch<
    React.SetStateAction<SubmitType | undefined>
  >;
  setHasEdited: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ResponseChangeHandlerProps {
  acceptAllowed: boolean;
  hasEdited: boolean;
  setHumanResponse: React.Dispatch<
    React.SetStateAction<HumanResponseWithEdits[]>
  >;
  setSelectedSubmitType: React.Dispatch<
    React.SetStateAction<SubmitType | undefined>
  >;
  setHasAddedResponse: React.Dispatch<React.SetStateAction<boolean>>;
}
