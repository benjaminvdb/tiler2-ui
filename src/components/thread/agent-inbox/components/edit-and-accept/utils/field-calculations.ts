import React from "react";

export function calculateDefaultRows(
  value: any,
  fieldKey: string,
  defaultRows: React.MutableRefObject<Record<string, number>>,
): number {
  // Calculate the default number of rows by the total length of the initial value divided by 30
  // or 8, whichever is greater. Stored in a ref to prevent re-rendering.
  if (defaultRows.current[fieldKey] === undefined) {
    defaultRows.current[fieldKey] = !value.length
      ? 3
      : Math.max(value.length / 30, 7);
  }
  return defaultRows.current[fieldKey] || 8;
}

export function formatFieldValue(value: any): string {
  return ["string", "number"].includes(typeof value)
    ? value
    : JSON.stringify(value, null);
}
