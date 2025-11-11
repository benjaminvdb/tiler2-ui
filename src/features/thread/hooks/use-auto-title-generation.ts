/**
 * Hook for automatic thread title generation
 * Triggers title generation after 3 human messages
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSse } from "./use-sse";

interface UseAutoTitleGenerationOptions {
  /**
   * The thread ID to generate a title for
   */
  threadId: string | null;

  /**
   * Array of messages in the thread
   */
  messages: Array<{ type: string; content: string }>;

  /**
   * Current thread title
   */
  currentTitle: string | null;

  /**
   * Whether the title was manually set by the user
   */
  titleManuallySet: boolean;

  /**
   * Whether this is a workflow thread
   */
  isWorkflow: boolean;

  /**
   * Workflow title (if workflow thread)
   */
  workflowTitle?: string | undefined;

  /**
   * API base URL
   */
  apiUrl: string;

  /**
   * Access token for authentication
   */
  accessToken: string | null;

  /**
   * Callback when title is generated
   */
  onTitleGenerated?: (title: string) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;
}

interface UseAutoTitleGenerationResult {
  /**
   * The generated title (or initial title)
   */
  title: string | null;

  /**
   * Whether title generation is in progress
   */
  isGenerating: boolean;

  /**
   * Whether an error occurred
   */
  hasError: boolean;

  /**
   * Error message if an error occurred
   */
  error: string | null;

  /**
   * Manually trigger title generation
   */
  generateTitle: () => void;
}

/**
 * Hook for automatic thread title generation
 * Automatically generates titles based on conversation flow:
 * - For workflows: Starts with workflow title, generates after 3 human messages
 * - For regular chats: Uses first message (truncated), generates after 3 human messages
 *
 * @example
 * ```tsx
 * const { title, isGenerating } = useAutoTitleGeneration({
 *   threadId: 'thread-123',
 *   messages: threadMessages,
 *   currentTitle: thread.metadata?.name,
 *   titleManuallySet: thread.metadata?.title_manually_set || false,
 *   isWorkflow: false,
 *   apiUrl: process.env.NEXT_PUBLIC_API_URL,
 *   accessToken: token,
 * });
 * ```
 */
export const useAutoTitleGeneration = (
  options: UseAutoTitleGenerationOptions,
): UseAutoTitleGenerationResult => {
  const {
    threadId,
    messages,
    currentTitle,
    titleManuallySet,
    isWorkflow,
    workflowTitle,
    apiUrl,
    accessToken,
    onTitleGenerated,
    onError,
  } = options;

  const [title, setTitle] = useState<string | null>(currentTitle);
  const [shouldGenerate, setShouldGenerate] = useState(false);

  // Track if we've already generated a title for this thread
  const hasGeneratedRef = useRef(false);
  const previousThreadIdRef = useRef<string | null>(null);

  // Build SSE URL
  const sseUrl =
    shouldGenerate && threadId && accessToken
      ? `${apiUrl}/api/v1/threads/${threadId}/generate-title`
      : null;

  // SSE connection
  const {
    data: generatedTitle,
    isConnected: isGenerating,
    hasError,
    error,
  } = useSse(sseUrl, {
    autoConnect: true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    onError: (err) => {
      onError?.(err);
      setShouldGenerate(false);
    },
    onClose: () => {
      setShouldGenerate(false);
    },
  });

  // Reset state when thread changes
  useEffect(() => {
    if (threadId !== previousThreadIdRef.current) {
      hasGeneratedRef.current = false;
      previousThreadIdRef.current = threadId;
      setTitle(currentTitle);
    }
  }, [threadId, currentTitle]);

  // Update title when current title changes (e.g., manual rename)
  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

  // Set initial title based on thread type
  useEffect(() => {
    if (!threadId || title || messages.length === 0) return;

    if (isWorkflow && workflowTitle) {
      // Workflow: Use full workflow title
      setTitle(workflowTitle);
    } else {
      // Regular chat: Use first message (truncated to 80 chars, newlines removed)
      const firstHumanMessage = messages.find((msg) => msg.type === "human");
      if (firstHumanMessage) {
        const truncated = firstHumanMessage.content
          .replace(/\n/g, " ") // Remove newlines
          .slice(0, 80); // Truncate to 80 chars
        setTitle(truncated);
      }
    }
  }, [threadId, title, messages, isWorkflow, workflowTitle]);

  // Count human messages
  const humanMessageCount = messages.filter(
    (msg) => msg.type === "human",
  ).length;

  // Trigger title generation after 3 human messages
  useEffect(() => {
    if (
      threadId &&
      !titleManuallySet &&
      !hasGeneratedRef.current &&
      humanMessageCount >= 1
    ) {
      hasGeneratedRef.current = true;
      setShouldGenerate(true);
    }
  }, [threadId, titleManuallySet, humanMessageCount]);

  // Update title when SSE returns data
  useEffect(() => {
    if (generatedTitle && !generatedTitle.startsWith("[ERROR]")) {
      setTitle(generatedTitle);
      onTitleGenerated?.(generatedTitle);
    }
  }, [generatedTitle, onTitleGenerated]);

  // Manual trigger function
  const generateTitle = useCallback(() => {
    if (threadId && !titleManuallySet) {
      hasGeneratedRef.current = false;
      setShouldGenerate(true);
    }
  }, [threadId, titleManuallySet]);

  return {
    title,
    isGenerating,
    hasError,
    error,
    generateTitle,
  };
};
