import React, { ReactNode, useState } from "react";
import { useQueryState } from "nuqs";
import { getApiKey } from "@/lib/api-key";
import { ConfigurationForm } from "./stream/configuration-form";
import { StreamSession } from "./stream/stream-session";

// Re-export types and context for backward compatibility
export type { StateType, StreamContextType } from "./stream/types";
export { useTypedStream } from "./stream/types";
export { useStreamContext } from "./stream/stream-context";
export { DEFAULT_API_URL, DEFAULT_ASSISTANT_ID } from "./stream/utils";

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Get environment variables
  const envApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  const envAssistantId: string | undefined =
    process.env.NEXT_PUBLIC_ASSISTANT_ID;

  // Use URL params with env var fallbacks
  const [apiUrl, setApiUrl] = useQueryState("apiUrl", {
    defaultValue: envApiUrl || "",
  });
  const [assistantId, setAssistantId] = useQueryState("assistantId", {
    defaultValue: envAssistantId || "",
  });

  // For API key, use localStorage with env var fallback
  const [apiKey, _setApiKey] = useState(() => {
    const storedKey = getApiKey();
    return storedKey || "";
  });

  const setApiKey = (key: string) => {
    window.localStorage.setItem("lg:chat:apiKey", key);
    _setApiKey(key);
  };

  // Determine final values to use, prioritizing URL params then env vars
  const finalApiUrl = apiUrl || envApiUrl;
  const finalAssistantId = assistantId || envAssistantId;

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
