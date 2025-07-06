import { JsonValue } from "@/types";

export const isComplexValue = (value: JsonValue): boolean => {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
};
