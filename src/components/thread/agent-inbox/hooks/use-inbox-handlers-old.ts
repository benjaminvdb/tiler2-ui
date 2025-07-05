import { toast } from "sonner";
import { ActionRequest } from "@langchain/langgraph/prebuilt";
import { HumanResponseWithEdits, SubmitType } from "../types";
import { haveArgsChanged } from "../utils";

interface UseInboxHandlersProps {
  acceptAllowed: boolean;
  hasEdited: boolean;
  hasAddedResponse: boolean;
  initialValues: Record<string, string>;
  setHumanResponse: React.Dispatch<React.SetStateAction<HumanResponseWithEdits[]>>;
  setSelectedSubmitType: React.Dispatch<React.SetStateAction<SubmitType | undefined>>;
  setHasEdited: React.Dispatch<React.SetStateAction<boolean>>;
  setHasAddedResponse: React.Dispatch<React.SetStateAction<boolean>>;
}

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
  const onEditChange = (
    change: string | string[],
    response: HumanResponseWithEdits,
    key: string | string[],
  ) => {
    if (
      (Array.isArray(change) && !Array.isArray(key)) ||
      (!Array.isArray(change) && Array.isArray(key))
    ) {
      toast.error("Error", {
        description: "Something went wrong",
        richColors: true,
        closeButton: true,
      });
      return;
    }

    let valuesChanged = true;
    if (typeof response.args === "object") {
      const updatedArgs = { ...(response.args?.args || {}) };

      if (Array.isArray(change) && Array.isArray(key)) {
        // Handle array inputs by mapping corresponding values
        change.forEach((value, index) => {
          if (index < key.length) {
            updatedArgs[key[index]] = value;
          }
        });
      } else {
        // Handle single value case
        updatedArgs[key as string] = change as string;
      }

      const haveValuesChanged = haveArgsChanged(updatedArgs, initialValues);
      valuesChanged = haveValuesChanged;
    }

    if (!valuesChanged) {
      setHasEdited(false);
      if (acceptAllowed) {
        setSelectedSubmitType("accept");
      } else if (hasAddedResponse) {
        setSelectedSubmitType("response");
      }
    } else {
      setSelectedSubmitType("edit");
      setHasEdited(true);
    }

    setHumanResponse((prev) => {
      if (typeof response.args !== "object" || !response.args) {
        console.error(
          "Mismatched response type",
          !!response.args,
          typeof response.args,
        );
        return prev;
      }

      const newEdit: HumanResponseWithEdits = {
        type: response.type,
        args: {
          action: response.args.action,
          args:
            Array.isArray(change) && Array.isArray(key)
              ? {
                  ...response.args.args,
                  ...Object.fromEntries(key.map((k, i) => [k, change[i]])),
                }
              : {
                  ...response.args.args,
                  [key as string]: change as string,
                },
        },
      };
      
      if (
        prev.find(
          (p) =>
            p.type === response.type &&
            typeof p.args === "object" &&
            p.args?.action === (response.args as ActionRequest).action,
        )
      ) {
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
      } else {
        throw new Error("No matching response found");
      }
    });
  };

  const onResponseChange = (
    change: string,
    response: HumanResponseWithEdits,
  ) => {
    if (!change) {
      setHasAddedResponse(false);
      if (hasEdited) {
        // The user has deleted their response, so we should set the submit type to
        // `edit` if they've edited, or `accept` if it's allowed and they have not edited.
        setSelectedSubmitType("edit");
      } else if (acceptAllowed) {
        setSelectedSubmitType("accept");
      }
    } else {
      setSelectedSubmitType("response");
      setHasAddedResponse(true);
    }

    setHumanResponse((prev) => {
      const newResponse: HumanResponseWithEdits = {
        type: response.type,
        args: change,
      };

      if (prev.find((p) => p.type === response.type)) {
        return prev.map((p) => {
          if (p.type === response.type) {
            if (p.acceptAllowed) {
              return {
                ...newResponse,
                acceptAllowed: true,
                editsMade: !!change,
              };
            }
            return newResponse;
          }
          return p;
        });
      } else {
        throw new Error("No human response found for string response");
      }
    });
  };

  return {
    onEditChange,
    onResponseChange,
  };
}