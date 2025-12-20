/**
 * Core streaming session component that manages chat state and authentication.
 * Provides StreamContext to child components for AI chat interactions.
 */

import React, { useCallback, useEffect } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { StreamContext } from "./stream-context";
import { StreamSessionProps } from "./stream-types";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { useObservability } from "@/core/services/observability";
import * as Sentry from "@sentry/react";
import { useStreamToken } from "./hooks/use-stream-token";
import { useThreadVerification } from "./hooks/use-thread-verification";
import { useGraphStatus } from "./hooks/use-graph-status";
import { useVercelAIChat } from "./hooks/use-vercel-ai-chat";
import { TokenErrorScreen } from "./components/token-error-screen";
import { useAuth0 } from "@auth0/auth0-react";

export const StreamSession: React.FC<StreamSessionProps> = ({
  children,
  apiUrl,
  assistantId,
}) => {
  const { loginWithRedirect } = useAuth0();

  const handleLoginRedirect = useCallback(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);

  const [threadId, setThreadId] = useSearchParamState("threadId");
  const { getThreads, resetThreads, removeOptimisticThread } = useThreads();

  const baseLogger = useObservability();
  const logger = baseLogger.child({
    component: "StreamSession",
    additionalData: {
      assistantId,
      apiUrl,
    },
  });

  useEffect(() => {
    if (assistantId) {
      Sentry.setContext("assistant", {
        id: assistantId,
        apiUrl: apiUrl,
      });
      Sentry.setTag("assistant_id", assistantId);
    }
  }, [assistantId, apiUrl]);

  const { accessToken, tokenError, isUserLoading, user } =
    useStreamToken(logger);

  const verifyThreadCreation = useThreadVerification({
    getThreads,
    resetThreads,
    removeOptimisticThread,
    logger,
  });

  useGraphStatus({ apiUrl, logger });

  // Handle thread ID updates from the agent
  const handleThreadId = useCallback(
    (id: string) => {
      setThreadId(id);
      verifyThreadCreation(id);
    },
    [setThreadId, verifyThreadCreation],
  );

  // Use the Vercel AI SDK UI hook
  const streamValue = useVercelAIChat({
    apiUrl,
    assistantId,
    threadId,
    accessToken,
    onThreadId: handleThreadId,
  });

  if (isUserLoading || (!accessToken && !tokenError && user)) {
    return (
      <StreamContext.Provider value={streamValue}>
        <LoadingScreen />
      </StreamContext.Provider>
    );
  }

  if (tokenError) {
    return (
      <StreamContext.Provider value={streamValue}>
        <TokenErrorScreen
          error={tokenError}
          onLoginRedirect={handleLoginRedirect}
        />
      </StreamContext.Provider>
    );
  }

  return (
    <StreamContext.Provider value={streamValue}>
      {children}
    </StreamContext.Provider>
  );
};
