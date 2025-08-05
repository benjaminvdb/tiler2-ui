"use client";

import React, { useEffect } from "react";
import { Thread } from "@/features/thread/components";
import { StreamProvider } from "@/core/providers/stream";
import { ArtifactProvider } from "@/features/artifacts/components";
import { useSearchParams, useRouter } from "next/navigation";
import { useStreamContext } from "@/core/providers/stream";

function ThreadWithWorkflowHandler(): React.ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stream = useStreamContext();
  const workflowId = searchParams.get('workflow');
  const [workflowStarted, setWorkflowStarted] = React.useState<string | null>(null);

  useEffect(() => {
    if (workflowId && workflowId !== workflowStarted) {
      setWorkflowStarted(workflowId);
      
      stream.submit(
        { messages: [] },
        {
          config: {
            configurable: {
              workflow_id: workflowId,
            },
          },
        }
      );
      
      router.replace('/');
    }
  }, [workflowId, stream, router, workflowStarted]);

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
