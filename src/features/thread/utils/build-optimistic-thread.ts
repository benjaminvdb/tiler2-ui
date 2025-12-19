/**
 * Optimistic thread building utility for immediate UI feedback.
 *
 * Constructs complete Thread objects for optimistic rendering in the sidebar
 * before server confirmation.
 */

import type { Thread } from "@/features/thread/providers/thread-provider";
import type { UIMessage } from "@/core/providers/stream/ag-ui-types";
import { getClientConfig } from "@/core/config/client";

interface OptimisticThreadOptions {
  /**
   * Pre-generated thread ID (crypto.randomUUID())
   */
  threadId: string;

  /**
   * Thread display name (workflow title or truncated first message)
   */
  threadName: string;

  /**
   * Current user's email for owner metadata
   */
  userEmail: string;

  /**
   * Optional first message for thread values
   */
  firstMessage?: UIMessage;
}

/**
 * Build a complete Thread object for optimistic UI rendering.
 *
 * Creates a thread structure that matches the Thread type
 * for immediate display in the sidebar before server confirmation.
 *
 * @param options - Thread building options
 * @returns Complete Thread object ready for display
 */
export function buildOptimisticThread(
  options: OptimisticThreadOptions,
): Thread {
  const now = new Date().toISOString();
  const assistantId = getClientConfig().assistantId;

  const thread: Thread = {
    thread_id: options.threadId,
    created_at: now,
    updated_at: now,
    metadata: {
      name: options.threadName,
      owner: options.userEmail,
      ...(assistantId && { assistant_id: assistantId }),
    },
    status: "idle",
    values: options.firstMessage
      ? {
          messages: [options.firstMessage],
        }
      : {},
  };

  return thread;
}
