/**
 * Hook for thread title management
 * Handles automatic title generation, workflow titles, and animations
 */

import { useEffect, useState } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { useStreamContext } from "@/core/providers/stream";
import { useAutoTitleGeneration } from "./use-auto-title-generation";
import { getClientConfig } from "@/core/config/client";

interface Workflow {
  workflow_id: string;
  title: string;
  description: string;
}

interface UseThreadTitleResult {
  /**
   * The current title to display
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
}

/**
 * Hook for comprehensive thread title management
 * Handles workflow titles, auto-generation, and animations
 *
 * @example
 * ```tsx
 * const { title, isGenerating } = useThreadTitle();
 * ```
 */
export const useThreadTitle = (): UseThreadTitleResult => {
  const { getToken } = useAccessToken({
    component: "useThreadTitle",
    operation: "getAccessToken",
  });

  const [threadId] = useSearchParamState("threadId");
  const [workflowId] = useSearchParamState("workflow");
  const stream = useStreamContext();
  const { apiUrl } = getClientConfig();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState<string | null>(null);
  const [threadMetadata, setThreadMetadata] = useState<any>(null);

  // Get access token
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      setAccessToken(token);
    };
    void fetchToken();
  }, [getToken]);

  // Fetch workflow title if this is a workflow thread
  useEffect(() => {
    if (!workflowId || !apiUrl || !accessToken) return;

    const fetchWorkflow = async () => {
      try {
        const response = await fetch(`${apiUrl}/workflows`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const workflows: Workflow[] = await response.json();
          const workflow = workflows.find((w) => w.workflow_id === workflowId);
          if (workflow) {
            setWorkflowTitle(workflow.title);
          }
        }
      } catch (error) {
        console.error("Failed to fetch workflow:", error);
      }
    };

    void fetchWorkflow();
  }, [workflowId, apiUrl, accessToken]);

  // Fetch thread metadata
  useEffect(() => {
    if (!threadId || !apiUrl || !accessToken) return;

    const fetchThreadMetadata = async () => {
      try {
        const response = await fetch(`${apiUrl}/threads/${threadId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const thread = await response.json();
          setThreadMetadata(thread.metadata || {});
        }
      } catch (error) {
        console.error("Failed to fetch thread metadata:", error);
      }
    };

    void fetchThreadMetadata();
  }, [threadId, apiUrl, accessToken]);

  // Convert messages to format needed by auto-title-generation
  const formattedMessages = stream.messages.map((msg) => ({
    type: msg.type,
    content: typeof msg.content === "string" ? msg.content : "",
  }));

  // Use auto title generation hook
  const { title, isGenerating, hasError, error } = useAutoTitleGeneration({
    threadId,
    messages: formattedMessages,
    currentTitle: threadMetadata?.name || null,
    titleManuallySet: threadMetadata?.title_manually_set || false,
    isWorkflow: !!workflowId,
    ...(workflowTitle && { workflowTitle }),
    apiUrl,
    accessToken,
  });

  return {
    title,
    isGenerating,
    hasError,
    error,
  };
};
