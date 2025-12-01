import React, { useEffect, useRef, useState } from "react";
import { Thread } from "@/features/thread/components";
import { Thread as ThreadType } from "@langchain/langgraph-sdk";
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
import { linkThreadToTask, getTaskContext } from "@/features/goals/services";

interface WorkflowData {
  id: number;
  workflow_id: string;
  title: string;
  description: string;
}

/**
 * Submits workflow without optimistic thread creation
 */
const submitWorkflowFallback = (
  stream: ReturnType<typeof useStreamContext>,
  workflowId: string,
) => {
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
};

/**
 * Creates and submits workflow with optimistic thread
 */
const submitWorkflowWithThread = (
  stream: ReturnType<typeof useStreamContext>,
  workflowId: string,
  workflow: WorkflowData,
  userEmail: string,
  addOptimisticThread: (thread: ThreadType) => void,
) => {
  const optimisticThreadId = crypto.randomUUID();
  const threadName = generateThreadName({ workflowTitle: workflow.title });
  const optimisticThread = buildOptimisticThread({
    threadId: optimisticThreadId,
    threadName,
    userEmail,
  });

  addOptimisticThread(optimisticThread);

  stream.submit(
    { messages: [] },
    {
      threadId: optimisticThreadId,
      metadata: { name: threadName },
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
};

/**
 * Handles workflow initialization and creates threads with workflow-specific metadata.
 * Watches for workflow query parameter and automatically submits to create a new thread.
 * @returns Thread component with artifact provider
 */
// eslint-disable-next-line max-lines-per-function -- Complex workflow/task handler with multiple effects
const ThreadWithWorkflowHandler = (): React.ReactNode => {
  const [searchParams] = useSearchParams();
  const stream = useStreamContext();
  const workflowId = searchParams.get("workflow");
  const taskId = searchParams.get("taskId");
  const [threadId, setThreadId] = useSearchParamState("threadId");
  const updateSearchParams = useSearchParamsUpdate();
  const { addOptimisticThread } = useThreads();
  const { user } = useAuth0();
  const [isSubmittingWorkflow, setIsSubmittingWorkflow] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const fetchWithAuth = useAuthenticatedFetch();

  const submittedWorkflowRef = useRef<string | null>(null);
  const submittedTaskRef = useRef<string | null>(null);
  const pendingTaskLinkRef = useRef<{
    taskId: string;
    threadId: string;
  } | null>(null);

  const apiUrl = getClientConfig().apiUrl;

  useEffect(() => {
    const submitWorkflow = async () => {
      if (
        !workflowId ||
        submittedWorkflowRef.current === workflowId ||
        isSubmittingWorkflow
      ) {
        return;
      }

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
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const workflows: WorkflowData[] = await response.json();
          const workflow = workflows.find((w) => w.workflow_id === workflowId);

          if (workflow && user?.email) {
            submitWorkflowWithThread(
              stream,
              workflowId,
              workflow,
              user.email,
              addOptimisticThread,
            );
          } else {
            console.warn(
              `Workflow ${workflowId} not found in API response, submitting without title`,
            );
            submitWorkflowFallback(stream, workflowId);
          }
        } else {
          console.error("Failed to fetch workflows, submitting without title");
          submitWorkflowFallback(stream, workflowId);
        }
      } catch (error) {
        console.error("Error fetching workflow data:", error);
        submitWorkflowFallback(stream, workflowId);
      } finally {
        setIsSubmittingWorkflow(false);
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

  // Handle task-based thread creation
  useEffect(() => {
    const submitTask = async () => {
      // Skip if already submitting, no task, or workflow takes priority
      if (
        !taskId ||
        workflowId ||
        submittedTaskRef.current === taskId ||
        isSubmittingTask ||
        isSubmittingWorkflow
      ) {
        return;
      }

      setIsSubmittingTask(true);
      console.log("Starting thread for task:", taskId);
      submittedTaskRef.current = taskId;

      if (threadId) {
        console.log("Clearing existing thread ID to start fresh task thread");
        setThreadId(null);
      }

      // Create optimistic thread with task context
      if (user?.email) {
        // Fetch task context to get the task title for thread naming
        let taskTitle = "Task";
        try {
          const taskContext = await getTaskContext(fetchWithAuth, taskId);
          taskTitle = taskContext.task_title;
        } catch (error) {
          console.error("Failed to fetch task context for thread name:", error);
        }

        const optimisticThreadId = crypto.randomUUID();
        const threadName = generateThreadName({
          taskTitle,
        });
        const optimisticThread = buildOptimisticThread({
          threadId: optimisticThreadId,
          threadName,
          userEmail: user.email,
        });

        addOptimisticThread(optimisticThread);

        // Store task link info to be processed when thread is confirmed
        pendingTaskLinkRef.current = {
          taskId,
          threadId: optimisticThreadId,
        };

        // Submit to create thread with task context
        stream.submit(
          { messages: [] },
          {
            threadId: optimisticThreadId,
            metadata: { name: threadName },
            config: {
              configurable: {
                task_id: taskId,
              },
            },
          },
        );

        console.log(`Task thread started: ${optimisticThreadId}`);
      }

      setIsSubmittingTask(false);
    };

    submitTask();
  }, [
    taskId,
    workflowId,
    threadId,
    setThreadId,
    user,
    stream,
    addOptimisticThread,
    fetchWithAuth,
    isSubmittingTask,
    isSubmittingWorkflow,
  ]);

  // Link thread to task and clear task params after thread is created
  useEffect(() => {
    const linkAndClearTask = async () => {
      if (!threadId || !taskId || !pendingTaskLinkRef.current) {
        return;
      }

      // Only process if this is the thread we created for the task
      if (pendingTaskLinkRef.current.threadId !== threadId) {
        return;
      }

      try {
        console.log(`Linking thread ${threadId} to task ${taskId}`);
        await linkThreadToTask(fetchWithAuth, taskId, { thread_id: threadId });
        console.log("Successfully linked thread to task");
      } catch (error) {
        console.error("Failed to link thread to task:", error);
      }

      // Note: We keep goalId and taskId in URL for the TaskThreadHeader to display
      // The header uses these to show task info and enable back navigation to goal

      // Clear pending link ref
      pendingTaskLinkRef.current = null;
    };

    linkAndClearTask();
  }, [threadId, taskId, fetchWithAuth, updateSearchParams]);

  return <Thread />;
};

/**
 * Main threads page component.
 * Wraps thread handler with artifact provider to enable side-panel artifact display.
 * @returns Root threads page with artifact support
 */
const ThreadsPage = (): React.ReactNode => {
  return (
    <ArtifactProvider>
      <ThreadWithWorkflowHandler />
    </ArtifactProvider>
  );
};

export default ThreadsPage;
