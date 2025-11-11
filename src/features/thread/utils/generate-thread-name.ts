/**
 * Thread name generation utilities for optimistic UI.
 *
 * This module generates thread names for immediate display in the sidebar.
 * The logic must match the backend sanitization rules for consistency.
 */

const THREAD_NAME_MAX_LENGTH = 80; // Frontend truncation limit
const DEFAULT_THREAD_NAME = "Untitled Conversation";

/**
 * Generate a thread name for optimistic UI display.
 *
 * Priority:
 * 1. Workflow title (if workflow conversation)
 * 2. First user message truncated to 80 chars
 * 3. Default "Untitled Conversation"
 *
 * @param options - Thread naming options
 * @returns Generated thread name
 */
export function generateThreadName(options: {
  workflowTitle?: string;
  firstMessage?: string;
}): string {
  // Priority 1: Workflow title
  if (options.workflowTitle) {
    const cleaned = options.workflowTitle.trim();
    if (cleaned.length > 0) {
      return truncateMessage(cleaned, THREAD_NAME_MAX_LENGTH);
    }
  }

  // Priority 2: First user message
  if (options.firstMessage) {
    const cleaned = options.firstMessage.trim();
    if (cleaned.length > 0) {
      return truncateMessage(cleaned, THREAD_NAME_MAX_LENGTH);
    }
  }

  // Priority 3: Default name
  return DEFAULT_THREAD_NAME;
}

/**
 * Truncate message to max length with ellipsis.
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns Truncated text with "..." suffix if truncated
 */
function truncateMessage(text: string, maxLength: number): string {
  const cleaned = text.trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Reserve 3 characters for ellipsis
  const truncated = cleaned.slice(0, maxLength - 3).trim();
  return `${truncated}...`;
}
