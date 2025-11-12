import React, { useEffect, useRef, useState } from "react";
import { Thread } from "@/features/thread/components";
import { ArtifactProvider } from "@/features/artifacts/components";
import { useSearchParams } from "@/core/routing/compat/next-navigation";
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

function ThreadWithWorkflowHandler(): React.ReactNode {
  const searchParams = useSearchParams();
  const stream = useStreamContext();
  const workflowId = searchParams.get("workflow");
  const [threadId, setThreadId] = useSearchParamState("threadId");
  const updateSearchParams = useSearchParamsUpdate();
  const { addOptimisticThread } = useThreads();
  const { user } = useAuth0();
  const [isSubmittingWorkflow, setIsSubmittingWorkflow] = useState(false);
  const fetchWithAuth = useAuthenticatedFetch();

  // Use ref to track if workflow has been submitted for this component instance
  const submittedWorkflowRef = useRef<string | null>(null);

  // Get environment variables
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

        // Clear the current thread ID to force creation of a new thread for the workflow
        if (threadId) {
          console.log("Clearing existing thread ID to start fresh workflow");
          setThreadId(null);
        }

        try {
          // Fetch workflow data to get the title
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
              // Generate pre-determined thread ID
              const optimisticThreadId = crypto.randomUUID();

              // Generate thread name from workflow title
              const threadName = generateThreadName({
                workflowTitle: workflow.title,
              });

              // Build optimistic thread object
              const optimisticThread = buildOptimisticThread({
                threadId: optimisticThreadId,
                threadName,
                userEmail: user.email,
              });

              // Add to sidebar immediately
              addOptimisticThread(optimisticThread);

              // Submit workflow with pre-determined thread ID and metadata
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
              // Fallback: Submit without workflow title if not found
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
            // Fallback: Submit without workflow data if fetch fails
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
          // Fallback: Submit workflow even if title fetch fails
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

  // Clear workflow param once we have a threadId (workflow has started)
  useEffect(() => {
    if (threadId && workflowId) {
      console.log("Workflow started, clearing workflow param from URL");
      updateSearchParams({ workflow: undefined });
    }
  }, [threadId, workflowId, updateSearchParams]);

  return <Thread />;
}

export default function ThreadsPage(): React.ReactNode {
  return (
    <ArtifactProvider>
      <ThreadWithWorkflowHandler />
    </ArtifactProvider>
  );
}
