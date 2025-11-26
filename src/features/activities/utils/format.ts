/**
 * Formatting utilities for activities feature.
 */

/**
 * Format a column name for display.
 * Converts snake_case to Title Case.
 *
 * @example
 * formatColumnTitle("impact_climate_change") // "Impact Climate Change"
 */
export function formatColumnTitle(columnName: string): string {
  return columnName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
