"use client";

import React, { useEffect, useRef } from "react";
import { Thread } from "@/features/thread/components";
import { ArtifactProvider } from "@/features/artifacts/components";
import { useSearchParams, useRouter } from "next/navigation";
import { useStreamContext } from "@/core/providers/stream";
import { useSearchParamState } from "@/core/routing/hooks";

function ThreadWithWorkflowHandler(): React.ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stream = useStreamContext();
  const workflowId = searchParams.get("workflow");
  const [threadId, setThreadId] = useSearchParamState("threadId");

  // Use ref to track if workflow has been submitted for this component instance
  const submittedWorkflowRef = useRef<string | null>(null);

  useEffect(() => {
    if (workflowId && submittedWorkflowRef.current !== workflowId) {
      console.log("Starting workflow:", workflowId);
      submittedWorkflowRef.current = workflowId;

      // Clear the current thread ID to force creation of a new thread for the workflow
      if (threadId) {
        console.log("Clearing existing thread ID to start fresh workflow");
        setThreadId(null);
      }

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

      // Don't navigate away immediately - let the workflow establish
      // The workflow param will be cleared once we receive a threadId
    }
  }, [workflowId, router, stream, threadId, setThreadId]);

  // Clear workflow param once we have a threadId (workflow has started)
  useEffect(() => {
    if (threadId && workflowId) {
      console.log("Workflow started, clearing workflow param from URL");
      // Use router.replace to clear workflow param but keep threadId
      router.replace(`/?threadId=${threadId}`);
    }
  }, [threadId, workflowId, router]);

  return <Thread />;
}

export default function ThreadsPage(): React.ReactNode {
  return (
    <ArtifactProvider>
      <ThreadWithWorkflowHandler />
    </ArtifactProvider>
  );
}
