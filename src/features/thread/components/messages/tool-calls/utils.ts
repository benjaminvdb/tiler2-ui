import { JsonValue } from "@/shared/types";

export const isComplexValue = (value: JsonValue): boolean => {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
};
