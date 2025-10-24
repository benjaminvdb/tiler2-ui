import { toast } from "sonner";
import { HumanResponseWithEdits } from "../../../types";
import { haveArgsChanged } from "../../../utils";
import { EditChangeHandlerProps } from "../types";
import {
  validateChangeKeyTypes,
  updateArguments,
} from "../utils/argument-updater";
import { resolveSubmitType } from "../utils/submit-type-resolver";
import {
  createEditResponse,
  updateHumanResponseWithEdit,
} from "../utils/response-updater";
import { getLogger } from "@/core/services/logging";

const logger = getLogger().child({
  component: "edit-change-handler",
});

/**
 * Creates the onEditChange handler function
 */
export function createEditChangeHandler({
  acceptAllowed,
  hasAddedResponse,
  initialValues,
  setHumanResponse,
  setSelectedSubmitType,
  setHasEdited,
}: EditChangeHandlerProps) {
  return (
    change: string | string[],
    response: HumanResponseWithEdits,
    key: string | string[],
  ) => {
    // Validate parameter types
    if (!validateChangeKeyTypes(change, key)) {
      toast.error("Error", {
        description: "Something went wrong",
        richColors: true,
        closeButton: true,
      });
      return;
    }

    let valuesChanged = true;
    if (typeof response.args === "object") {
      const updatedArgs = updateArguments(
        response.args?.args || {},
        change,
        key,
      );
      const haveValuesChanged = haveArgsChanged(updatedArgs, initialValues);
      valuesChanged = haveValuesChanged;
    }

    // Determine submit type based on changes
    const submitType = resolveSubmitType(
      valuesChanged,
      acceptAllowed,
      hasAddedResponse,
    );
    setSelectedSubmitType(submitType);
    setHasEdited(valuesChanged);

    // Update human response state
    setHumanResponse((prev) => {
      if (typeof response.args !== "object" || !response.args) {
        logger.error("Mismatched response type", {
          operation: "handle_edit_change",
          hasArgs: !!response.args,
          argsType: typeof response.args,
        });
        return prev;
      }

      const newEdit = createEditResponse({
        response,
        change,
        key,
        valuesChanged,
      });
      return updateHumanResponseWithEdit({
        prev,
        response,
        newEdit,
        valuesChanged,
      });
    });
  };
}
