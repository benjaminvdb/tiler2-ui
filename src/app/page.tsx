import React, { useEffect, useRef, useState } from "react";
import { Thread } from "@/features/thread/components";
import { ArtifactProvider } from "@/features/artifacts/components";
import { useSearchParams } from "react-router-dom";
import { useStreamContext } from "@/core/providers/stream";
import {
  useSearchParamState,
  useSearchParamsUpdate,
} from "@/core/routing/hooks";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { generateThreadName } from "@/features/thread/utils/generate-thread-name";
import { buildOptimisticThread } from "@/features/thread/utils/build-optimistic-thread";
import { getClientConfig } from "@/core/config/client";

interface WorkflowData {
  id: number;
  workflow_id: string;
  title: string;
  description: string;
}

/**
 * Handles workflow initialization and creates threads with workflow-specific metadata.
 * Watches for workflow query parameter and automatically submits to create a new thread.
 * @returns Thread component with artifact provider
 */
function ThreadWithWorkflowHandler(): React.ReactNode {
  const [searchParams] = useSearchParams();
  const stream = useStreamContext();
  const workflowId = searchParams.get("workflow");
  const [threadId, setThreadId] = useSearchParamState("threadId");
  const updateSearchParams = useSearchParamsUpdate();
  const { addOptimisticThread } = useThreads();
  const { user } = useAuth0();
  const [isSubmittingWorkflow, setIsSubmittingWorkflow] = useState(false);
  const fetchWithAuth = useAuthenticatedFetch();

  const submittedWorkflowRef = useRef<string | null>(null);

  const apiUrl = getClientConfig().apiUrl;

  useEffect(() => {
    const submitWorkflow = async () => {
      if (
        workflowId &&
        submittedWorkflowRef.current !== workflowId &&
        !isSubmittingWorkflow
      ) {
        setIsSubmittingWorkflow(true);
        console.log("Starting workflow:", workflowId);
        submittedWorkflowRef.current = workflowId;

        if (threadId) {
          console.log("Clearing existing thread ID to start fresh workflow");
          setThreadId(null);
        }

        try {
          const response = await fetchWithAuth(`${apiUrl}/workflows`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const workflows: WorkflowData[] = await response.json();
            const workflow = workflows.find(
              (w) => w.workflow_id === workflowId,
            );

            if (workflow && user?.email) {
              const optimisticThreadId = crypto.randomUUID();

              const threadName = generateThreadName({
                workflowTitle: workflow.title,
              });

              const optimisticThread = buildOptimisticThread({
                threadId: optimisticThreadId,
                threadName,
                userEmail: user.email,
              });

              addOptimisticThread(optimisticThread);

              stream.submit(
                { messages: [] },
                {
                  threadId: optimisticThreadId,
                  metadata: {
                    name: threadName,
                  },
                  config: {
                    configurable: {
                      workflow_id: workflowId,
                    },
                  },
                },
              );

              console.log(
                `Workflow "${workflow.title}" started with thread: ${optimisticThreadId}`,
              );
            } else {
              console.warn(
                `Workflow ${workflowId} not found in API response, submitting without title`,
              );
              stream.submit(
                { messages: [] },
                {
                  config: {
                    configurable: {
                      workflow_id: workflowId,
                    },
                  },
                },
              );
            }
          } else {
            console.error(
              "Failed to fetch workflows, submitting without title",
            );
            stream.submit(
              { messages: [] },
              {
                config: {
                  configurable: {
                    workflow_id: workflowId,
                  },
                },
              },
            );
          }
        } catch (error) {
          console.error("Error fetching workflow data:", error);
          stream.submit(
            { messages: [] },
            {
              config: {
                configurable: {
                  workflow_id: workflowId,
                },
              },
            },
          );
        } finally {
          setIsSubmittingWorkflow(false);
        }
      }
    };

    submitWorkflow();
  }, [
    workflowId,
    stream,
    threadId,
    setThreadId,
    apiUrl,
    user,
    addOptimisticThread,
    isSubmittingWorkflow,
    fetchWithAuth,
  ]);

  useEffect(() => {
    if (threadId && workflowId) {
      console.log("Workflow started, clearing workflow param from URL");
      updateSearchParams({ workflow: undefined });
    }
  }, [threadId, workflowId, updateSearchParams]);

  return <Thread />;
}

/**
 * Main threads page component.
 * Wraps thread handler with artifact provider to enable side-panel artifact display.
 * @returns Root threads page with artifact support
 */
export default function ThreadsPage(): React.ReactNode {
  return (
    <ArtifactProvider>
      <ThreadWithWorkflowHandler />
    </ArtifactProvider>
  );
}
