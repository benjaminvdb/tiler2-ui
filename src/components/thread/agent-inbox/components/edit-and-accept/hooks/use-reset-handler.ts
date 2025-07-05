import { HumanResponseWithEdits } from "../../../types";

export function useResetHandler(
  editResponse: HumanResponseWithEdits | undefined,
  initialValues: Record<string, string>,
  onEditChange: (
    text: string | string[],
    response: HumanResponseWithEdits,
    key: string | string[],
  ) => void,
) {
  const handleReset = () => {
    if (
      !editResponse ||
      typeof editResponse.args !== "object" ||
      !editResponse.args ||
      !editResponse.args.args
    ) {
      return;
    }

    // use initialValues to reset the text areas
    const keysToReset: string[] = [];
    const valuesToReset: string[] = [];

    Object.entries(initialValues).forEach(([k, v]) => {
      if (k in (editResponse.args as Record<string, any>).args) {
        const value = ["string", "number"].includes(typeof v)
          ? v
          : JSON.stringify(v, null);
        keysToReset.push(k);
        valuesToReset.push(value);
      }
    });

    if (keysToReset.length > 0 && valuesToReset.length > 0) {
      onEditChange(valuesToReset, editResponse, keysToReset);
    }
  };

  return { handleReset };
}
