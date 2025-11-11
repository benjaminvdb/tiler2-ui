import React, { ReactNode, useMemo } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import { getClientConfig } from "@/core/config/client";
import { ConfigurationForm } from "./stream/configuration-form";
import { StreamSession } from "./stream/stream-session";
import { StreamErrorBoundary } from "@/shared/components/error-boundary/stream-error-boundary";

export { useStreamContext } from "./stream/stream-context";
export type { StreamContextType, GraphState } from "./stream/types";

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const clientConfig = getClientConfig();

  const [apiUrl, setApiUrl] = useSearchParamState("apiUrl");
  const [assistantId, setAssistantId] = useSearchParamState("assistantId");

  const finalApiUrl = useMemo(
    () => apiUrl || clientConfig.apiUrl,
    [apiUrl, clientConfig.apiUrl],
  );
  const finalAssistantId = useMemo(
    () => assistantId || clientConfig.assistantId,
    [assistantId, clientConfig.assistantId],
  );

  if (!finalApiUrl || !finalAssistantId) {
    return (
      <ConfigurationForm
        apiUrl={apiUrl || ""}
        assistantId={assistantId || ""}
        onSubmit={({ apiUrl, assistantId }) => {
          setApiUrl(apiUrl || null);
          setAssistantId(assistantId || null);
        }}
      />
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
