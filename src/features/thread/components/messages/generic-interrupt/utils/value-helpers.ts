import { FieldValue, JsonValue } from "@/shared/types";

export const isComplexValue = (value: FieldValue): boolean => {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
};

export const shouldTruncateContent = (interrupt: JsonValue): boolean => {
  const contentStr = JSON.stringify(interrupt, null, 2);
  const contentLines = contentStr.split("\n");
  return contentLines.length > 4 || contentStr.length > 500;
};

export const truncateValue = (
  value: FieldValue,
  isExpanded: boolean,
): FieldValue => {
  if (typeof value === "string" && value.length > 100) {
    return value.substring(0, 100) + "...";
  }

  if (Array.isArray(value) && !isExpanded) {
    return value.slice(0, 2).map((v) => truncateValue(v, isExpanded));
  }

  if (isComplexValue(value) && !isExpanded) {
    const strValue = JSON.stringify(value, null, 2);
    if (strValue.length > 100) {
      // Return plain text for truncated content instead of a JSON object
      return `Truncated ${strValue.length} characters...`;
    }
  }

  return value;
};
