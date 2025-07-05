import { truncateValue, shouldTruncateContent } from "./value-helpers";

export function processInterruptEntries(
  interrupt: Record<string, any> | Record<string, any>[],
  isExpanded: boolean,
): [string, any][] {
  if (Array.isArray(interrupt)) {
    const items = isExpanded ? interrupt : interrupt.slice(0, 5);
    return items.map((item, index) => [index.toString(), item]);
  } else {
    const entries = Object.entries(interrupt);
    const shouldTruncate = shouldTruncateContent(interrupt);

    if (!isExpanded && shouldTruncate) {
      // When collapsed, process each value to potentially truncate it
      return entries.map(([key, value]) => [
        key,
        truncateValue(value, isExpanded),
      ]);
    }

    return entries;
  }
}
