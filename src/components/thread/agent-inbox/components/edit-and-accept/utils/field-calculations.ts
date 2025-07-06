import React from "react";
import { FieldValue } from "@/types";

export const calculateDefaultRows = (
  value: FieldValue,
  fieldKey: string,
  defaultRows: React.MutableRefObject<Record<string, number>>,
): number => {
  // Calculate the default number of rows by the total length of the initial value divided by 30
  // or 8, whichever is greater. Stored in a ref to prevent re-rendering.
  if (defaultRows.current[fieldKey] === undefined) {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value);
    defaultRows.current[fieldKey] = !stringValue.length
      ? 3
      : Math.max(stringValue.length / 30, 7);
  }
  return defaultRows.current[fieldKey] || 8;
};

export const formatFieldValue = (value: FieldValue): string => {
  return ["string", "number"].includes(typeof value)
    ? String(value)
    : JSON.stringify(value, null);
};
