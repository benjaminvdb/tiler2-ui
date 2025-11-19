import React, { ReactNode } from "react";
import { getClientConfig } from "@/core/config/client";
import { StreamSession } from "./stream/stream-session";
import { StreamErrorBoundary } from "@/shared/components/error-boundary/stream-error-boundary";

// eslint-disable-next-line react-refresh/only-export-components -- Re-export hook from child module
export { useStreamContext } from "./stream/stream-context";
export type { StreamContextType, GraphState } from "./stream/types";

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const clientConfig = getClientConfig();
  const finalApiUrl = clientConfig.apiUrl;
  const finalAssistantId = clientConfig.assistantId;

  if (!finalApiUrl || !finalAssistantId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Configuration required</h2>
          <p className="text-muted-foreground">
            Please set <code>VITE_API_URL</code> and{" "}
            <code>VITE_ASSISTANT_ID</code> in your environment before running
            the app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StreamErrorBoundary
      assistantId={finalAssistantId}
      threadId={null}
    >
      <StreamSession
        apiUrl={finalApiUrl}
        assistantId={finalAssistantId}
      >
        {children}
      </StreamSession>
    </StreamErrorBoundary>
  );
};
