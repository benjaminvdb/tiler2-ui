import { UseInboxHandlersProps } from "./types";
import { createEditChangeHandler } from "./handlers/edit-change-handler";
import { createResponseChangeHandler } from "./handlers/response-change-handler";

export function useInboxHandlers({
  acceptAllowed,
  hasEdited,
  hasAddedResponse,
  initialValues,
  setHumanResponse,
  setSelectedSubmitType,
  setHasEdited,
  setHasAddedResponse,
}: UseInboxHandlersProps) {
  const onEditChange = createEditChangeHandler({
    acceptAllowed,
    hasAddedResponse,
    initialValues,
    setHumanResponse,
    setSelectedSubmitType,
    setHasEdited,
  });

  const onResponseChange = createResponseChangeHandler({
    acceptAllowed,
    hasEdited,
    setHumanResponse,
    setSelectedSubmitType,
    setHasAddedResponse,
  });

  return {
    onEditChange,
    onResponseChange,
  };
}

// Re-export types for convenience
export type { UseInboxHandlersProps } from "./types";
