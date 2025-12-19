const THREAD_NAME_MAX_LENGTH = 80;
const ELLIPSIS = "...";
const DEFAULT_THREAD_NAME = "Untitled Conversation";

const truncateMessage = (text: string, maxLength: number): string => {
  const cleaned = text.trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  const sliceLength = Math.max(0, maxLength - ELLIPSIS.length);
  return `${cleaned.slice(0, sliceLength).trim()}${ELLIPSIS}`;
};

export function generateThreadName({
  workflowTitle,
  taskTitle,
  firstMessage,
}: {
  workflowTitle?: string;
  taskTitle?: string;
  firstMessage?: string;
}): string {
  const candidates = [workflowTitle, taskTitle, firstMessage]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim());

  if (candidates.length > 0) {
    return truncateMessage(candidates[0], THREAD_NAME_MAX_LENGTH);
  }

  return DEFAULT_THREAD_NAME;
}
