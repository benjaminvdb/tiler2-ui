import React, { ReactNode, useState, useMemo } from "react";
import { useQueryState } from "nuqs";
import { getApiKey, setApiKey as setApiKeyStorage } from "@/lib/api-key";
import { getClientConfig } from "@/config/client";
import { ConfigurationForm } from "./stream/configuration-form";
import { StreamSession } from "./stream/stream-session";

// Re-export types and context for backward compatibility
export type { StateType, StreamContextType } from "./stream/types";
export { useTypedStream } from "./stream/types";
export { useStreamContext } from "./stream/stream-context";

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

  // For API key, use localStorage with env var fallback
  const [apiKey, _setApiKey] = useState(() => {
    const storedKey = getApiKey();
    return storedKey || "";
  });

  const setApiKey = (key: string) => {
    setApiKeyStorage(key);
    _setApiKey(key);
  };

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
        apiKey={apiKey}
        onSubmit={({ apiUrl, assistantId, apiKey }) => {
          setApiUrl(apiUrl);
          setApiKey(apiKey);
          setAssistantId(assistantId);
        }}
      />
    );
  }

  return (
    <StreamSession
      apiKey={apiKey}
      apiUrl={finalApiUrl}
      assistantId={finalAssistantId}
    >
      {children}
    </StreamSession>
  );
};

// Re-export the default context for backward compatibility
export { StreamContext as default } from "./stream/stream-context";
