"use client";

import React, { useEffect, useRef } from "react";
import { Thread } from "@/features/thread/components";
import { StreamProvider } from "@/core/providers/stream";
import { ArtifactProvider } from "@/features/artifacts/components";
import { useSearchParams, useRouter } from "next/navigation";
import { useStreamContext } from "@/core/providers/stream";
import { useQueryState } from "nuqs";

function ThreadWithWorkflowHandler(): React.ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stream = useStreamContext();
  const workflowId = searchParams.get("workflow");
  const [threadId, setThreadId] = useQueryState("threadId");

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

      // Clean URL after successful submission
      setTimeout(() => {
        router.replace("/");
      }, 100);
    }
  }, [workflowId, router, stream, threadId, setThreadId]);

  return <Thread />;
}

export default function ThreadsPage(): React.ReactNode {
  return (
    <StreamProvider>
      <ArtifactProvider>
        <ThreadWithWorkflowHandler />
      </ArtifactProvider>
    </StreamProvider>
  );
}
