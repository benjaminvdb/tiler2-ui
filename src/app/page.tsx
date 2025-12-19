import React, { useEffect, useRef, useState } from "react";
import { Thread } from "@/features/thread/components";
import type { Thread as ThreadType } from "@/features/thread/providers/thread-provider";
import { ArtifactProvider } from "@/features/artifacts/components";
import { useSearchParams } from "react-router-dom";
import { useCopilotChat } from "@/core/providers/copilotkit";
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
import type { UseCopilotChatReturn } from "@/core/providers/copilotkit";
import type { Message, ToolCall } from "@copilotkit/shared";

interface WorkflowData {
  id: number;
  workflow_id: string;
  title: string;
  description: string;
}

type ThreadMessagePayload = {
  id: string;
  role: Message["role"];
  content: Message["content"];
  toolCalls?: ToolCall[];
  toolCallId?: string;
  toolName?: string;
  activityType?: string;
  error?: string;
};

type UserContent = Extract<Message, { role: "user" }>["content"];

const normalizeActivityContent = (
  content: Message["content"],
): Record<string, unknown> => {
  if (content && typeof content === "object" && !Array.isArray(content)) {
    return content as Record<string, unknown>;
  }
  return {};
};

const normalizeUserContent = (
  content: Message["content"],
): UserContent => {
  if (typeof content === "string" || Array.isArray(content)) {
    return content as UserContent;
  }
  return "";
};

const normalizeAssistantContent = (
  content: Message["content"],
): string | undefined => {
  if (typeof content === "string") {
    return content;
  }
  return undefined;
};

const normalizeToolContent = (content: Message["content"]): string => {
  if (typeof content === "string") {
    return content;
  }
  try {
    return JSON.stringify(content ?? "");
  } catch {
    return "";
  }
};

const normalizeTextContent = (content: Message["content"]): string => {
  if (typeof content === "string") {
    return content;
  }
  try {
    return JSON.stringify(content ?? "");
  } catch {
    return "";
  }
};

const mapThreadMessage = (msg: ThreadMessagePayload): Message => {
  switch (msg.role) {
    case "activity":
      return {
        id: msg.id,
        role: "activity",
        activityType: msg.activityType ?? "activity",
        content: normalizeActivityContent(msg.content),
      };
    case "tool":
      return {
        id: msg.id,
        role: "tool",
        content: normalizeToolContent(msg.content),
        toolCallId: msg.toolCallId ?? "",
        ...(msg.toolName ? { toolName: msg.toolName } : {}),
        ...(msg.error ? { error: msg.error } : {}),
      };
    case "assistant":
      return {
        id: msg.id,
        role: "assistant",
        content: normalizeAssistantContent(msg.content),
        ...(msg.toolCalls ? { toolCalls: msg.toolCalls } : {}),
      };
    case "system":
      return {
        id: msg.id,
        role: "system",
        content: normalizeTextContent(msg.content),
      };
    case "developer":
      return {
        id: msg.id,
        role: "developer",
        content: normalizeTextContent(msg.content),
      };
    case "user":
      return {
        id: msg.id,
        role: "user",
        content: normalizeUserContent(msg.content),
      };
    default:
      return {
        id: msg.id,
        role: "assistant",
        content: normalizeAssistantContent(msg.content),
      };
  }
};

/**
 * Submits workflow without optimistic thread creation
 */
const submitWorkflowFallback = (
  chat: UseCopilotChatReturn,
  workflowId: string,
) => {
  // Submit with workflow_id so backend can load workflow title for thread name
  chat.submit({ content: "" }, { configurable: { workflow_id: workflowId } });
};

/**
 * Creates and submits workflow with optimistic thread
 */
const submitWorkflowWithThread = (
  chat: UseCopilotChatReturn,
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

  // Submit workflow with workflow_id so backend can load workflow title for thread name
  chat.submit({ content: "" }, { configurable: { workflow_id: workflowId } });
};

/**
 * Handles workflow initialization and creates threads with workflow-specific metadata.
 * Watches for workflow query parameter and automatically submits to create a new thread.
 * @returns Thread component with artifact provider
 */
// eslint-disable-next-line max-lines-per-function -- Complex workflow/task handler with multiple effects
const ThreadWithWorkflowHandler = (): React.ReactNode => {
  const [searchParams] = useSearchParams();
  const [threadId, setThreadId] = useSearchParamState("threadId");
  const chat = useCopilotChat();
  const workflowId = searchParams.get("workflow");
  const taskId = searchParams.get("taskId");
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
  const hydratedThreadRef = useRef<string | null>(null);
  const previousThreadIdRef = useRef<string | null>(threadId);
  const skipThreadIdSyncRef = useRef(false);

  const apiUrl = getClientConfig().apiUrl;

  // Hydrate existing thread history when navigating via threadId
  useEffect(() => {
    const hydrate = async () => {
      if (!threadId) {
        hydratedThreadRef.current = null;
        return;
      }
      if (hydratedThreadRef.current === threadId) {
        return;
      }

      try {
        const response = await fetchWithAuth(
          `${apiUrl}/agent/threads/${threadId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!response.ok) {
          console.error(
            `Failed to load thread ${threadId}: ${response.status}`,
          );
          return;
        }

        const data = await response.json();
        const mappedMessages: Message[] = (data.messages || []).map(
          (msg: ThreadMessagePayload) => mapThreadMessage(msg),
        );

        chat.reset();
        chat.setMessages(mappedMessages);
        if (data.state !== undefined) {
          chat.agent?.setState(data.state);
        }
        hydratedThreadRef.current = threadId;
      } catch (error) {
        console.error("Error hydrating thread history:", error);
      }
    };

    hydrate();
  }, [threadId, apiUrl, fetchWithAuth, chat]);

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
      submittedWorkflowRef.current = workflowId;

      if (threadId) {
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
              chat,
              workflowId,
              workflow,
              user.email,
              addOptimisticThread,
            );
          } else {
            console.warn(
              `Workflow ${workflowId} not found in API response, submitting without title`,
            );
            submitWorkflowFallback(chat, workflowId);
          }
        } else {
          console.error("Failed to fetch workflows, submitting without title");
          submitWorkflowFallback(chat, workflowId);
        }
      } catch (error) {
        console.error("Error fetching workflow data:", error);
        submitWorkflowFallback(chat, workflowId);
      } finally {
        setIsSubmittingWorkflow(false);
      }
    };

    submitWorkflow();
  }, [
    workflowId,
    chat,
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
      updateSearchParams({ workflow: undefined });
    }
  }, [threadId, workflowId, updateSearchParams]);

  useEffect(() => {
    if (previousThreadIdRef.current && !threadId) {
      skipThreadIdSyncRef.current = true;
    }
    previousThreadIdRef.current = threadId;
  }, [threadId]);

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
      submittedTaskRef.current = taskId;

      if (threadId) {
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
        // Backend generates thread name, but needs task_id in configurable
        chat.submit(
          { content: "" },
          {
            configurable: {
              task_id: taskId,
            },
          },
        );
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
    chat,
    addOptimisticThread,
    fetchWithAuth,
    isSubmittingTask,
    isSubmittingWorkflow,
  ]);

  // Synchronize URL threadId with CopilotKit's threadId
  // Only sync AFTER messages exist (thread was created in backend)
  // AG-UI always generates a threadId on mount, so we can't sync immediately
  const chatThreadId = chat.threadId;
  const hasMessages = chat.messages.length > 0;
  useEffect(() => {
    if (skipThreadIdSyncRef.current) {
      if (!hasMessages) {
        skipThreadIdSyncRef.current = false;
      }
      return;
    }

    if (chatThreadId && !threadId && !workflowId && !taskId && hasMessages) {
      // Thread was created in backend - sync to URL
      setThreadId(chatThreadId);
    }
  }, [chatThreadId, threadId, workflowId, taskId, setThreadId, hasMessages]);

  // Link thread to task and clear task params after thread is created
  // Use chat.threadId from CopilotKit instead of URL param for detection
  useEffect(() => {
    const linkAndClearTask = async () => {
      const confirmedThreadId = threadId || chatThreadId;
      if (!confirmedThreadId || !taskId || !pendingTaskLinkRef.current) {
        return;
      }

      // Only process if this is the thread we created for the task
      if (pendingTaskLinkRef.current.threadId !== confirmedThreadId) {
        return;
      }

      try {
        await linkThreadToTask(fetchWithAuth, taskId, {
          thread_id: confirmedThreadId,
        });
      } catch (error) {
        console.error("Failed to link thread to task:", error);
      }

      // Note: We keep goalId and taskId in URL for the TaskThreadHeader to display
      // The header uses these to show task info and enable back navigation to goal

      // Clear pending link ref
      pendingTaskLinkRef.current = null;
    };

    linkAndClearTask();
  }, [threadId, chatThreadId, taskId, fetchWithAuth, updateSearchParams]);

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
