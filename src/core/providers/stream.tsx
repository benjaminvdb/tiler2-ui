import React, { ReactNode, useMemo } from "react";
import { useQueryState } from "nuqs";
import { getClientConfig } from "@/core/config/client";
import { ConfigurationForm } from "./stream/configuration-form";
import { StreamSession } from "./stream/stream-session";

// Re-export stream context and types for convenience
export { useStreamContext } from "./stream/stream-context";
export type { StreamContextType, StateType } from "./stream/types";

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Get client configuration
  const clientConfig = getClientConfig();

  // Use URL params with env var fallbacks
  const [apiUrl, setApiUrl] = useQueryState("apiUrl", {
    defaultValue: clientConfig.apiUrl || "",
  });
  const [assistantId, setAssistantId] = useQueryState("assistantId", {
    defaultValue: clientConfig.assistantId || "",
  });
  const [workflowType] = useQueryState("workflow", {
    defaultValue: "",
  });

  // Memoize final values to prevent unnecessary re-renders
  const finalApiUrl = useMemo(
    () => apiUrl || clientConfig.apiUrl,
    [apiUrl, clientConfig.apiUrl],
  );
  const finalAssistantId = useMemo(
    () => assistantId || clientConfig.assistantId,
    [assistantId, clientConfig.assistantId],
  );

  // Show the form if we: don't have an API URL, or don't have an assistant ID
  if (!finalApiUrl || !finalAssistantId) {
    return (
      <ConfigurationForm
        apiUrl={apiUrl}
        assistantId={assistantId}
        onSubmit={({ apiUrl, assistantId }) => {
          setApiUrl(apiUrl);
          setAssistantId(assistantId);
        }}
      />
    );
  }
  return (
    <StreamSession
      apiUrl={finalApiUrl}
      assistantId={finalAssistantId}
      {...(workflowType &&
        workflowType.trim() && { workflowType: workflowType.trim() })}
    >
      {children}
    </StreamSession>
  );
};
