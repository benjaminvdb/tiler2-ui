import { format } from "date-fns";
import { startCase } from "lodash";

export const prettifyText = (action: string): string => {
  return startCase(action.replace(/_/g, " "));
};

export const unknownToPrettyDate = (input: unknown): string | undefined => {
  try {
    if (
      Object.prototype.toString.call(input) === "[object Date]" ||
      new Date(input as string)
    ) {
      return format(new Date(input as string), "MM/dd/yyyy hh:mm a");
    }
  } catch {
    // failed to parse date. no-op
  }
  return undefined;
};
