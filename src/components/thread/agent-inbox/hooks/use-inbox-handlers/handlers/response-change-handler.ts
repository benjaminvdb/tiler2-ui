import { HumanResponseWithEdits } from "../../../types";
import { ResponseChangeHandlerProps } from "../types";
import { resolveSubmitTypeForResponse } from "../utils/submit-type-resolver";
import { createStringResponse, updateHumanResponseWithString } from "../utils/response-updater";

/**
 * Creates the onResponseChange handler function
 */
export function createResponseChangeHandler({
  acceptAllowed,
  hasEdited,
  setHumanResponse,
  setSelectedSubmitType,
  setHasAddedResponse,
}: ResponseChangeHandlerProps) {
  return (
    change: string,
    response: HumanResponseWithEdits,
  ) => {
    const hasContent = !!change;
    
    // Update response state
    setHasAddedResponse(hasContent);
    
    // Determine submit type
    const submitType = resolveSubmitTypeForResponse(hasContent, hasEdited, acceptAllowed);
    if (submitType) {
      setSelectedSubmitType(submitType);
    }

    // Update human response state
    setHumanResponse((prev) => {
      const newResponse = createStringResponse({ response, change });
      return updateHumanResponseWithString({ prev, response, newResponse, hasContent });
    });
  };
}