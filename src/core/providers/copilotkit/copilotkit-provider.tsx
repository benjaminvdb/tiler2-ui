/**
 * CopilotKit provider that wraps the app with authentication context.
 *
 * This provider:
 * - Connects to the CopilotKit runtime endpoint
 * - Forwards the Auth0 JWT token via properties
 * - Enables the premium useCopilotChatHeadless_c hook
 *
 * Verified from CopilotKit source:
 * - CopilotKitProps.runtimeUrl (copilotkit-props.tsx:54)
 * - CopilotKitProps.properties (copilotkit-props.tsx:100)
 * - CopilotKitProps.publicApiKey (copilotkit-props.tsx:22)
 */

import { CopilotKit, useThreads } from "@copilotkit/react-core";
import { useAuth0 } from "@auth0/auth0-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useCopilotChat } from "./use-copilot-chat";

interface CopilotKitProviderProps {
  children: ReactNode;
  threadId?: string | null;
}

const CopilotThreadSync = ({ threadId }: { threadId?: string | null }) => {
  const { threadId: internalThreadId, setThreadId } = useThreads();
  const chat = useCopilotChat();
  const previousThreadIdRef = useRef<string | null>(threadId ?? null);

  useEffect(() => {
    if (threadId && threadId !== internalThreadId) {
      setThreadId(threadId);
    }

    if (!threadId && previousThreadIdRef.current) {
      const nextThreadId = crypto.randomUUID();
      chat.stop();
      chat.reset();
      setThreadId(nextThreadId);
    }

    previousThreadIdRef.current = threadId ?? null;
  }, [threadId, internalThreadId, setThreadId, chat]);

  return null;
};

export const CopilotKitProvider = ({
  children,
  threadId,
}: CopilotKitProviderProps) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently()
        .then(setAuthToken)
        .catch((error) => {
          console.error("Failed to get access token:", error);
        });
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // Use local dev server in development, Vercel function in production
  const runtimeUrl = import.meta.env.DEV
    ? "http://localhost:4000/copilotkit"
    : "/api/copilotkit";

  return (
    <CopilotKit
      runtimeUrl={runtimeUrl}
      publicApiKey="ck_pub_18c4681b69ef8cded6ae620e372e3914"
      properties={{ authorization: authToken }}
    >
      <CopilotThreadSync threadId={threadId ?? null} />
      {children}
    </CopilotKit>
  );
};
