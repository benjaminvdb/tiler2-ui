/** Tailwind CSS utility for merging class names with conflict resolution. */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge to resolve conflicts.
 * Ensures later Tailwind classes override earlier ones (e.g., "p-4 p-6" -> "p-6").
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};
