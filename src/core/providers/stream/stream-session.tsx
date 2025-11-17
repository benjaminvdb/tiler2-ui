import React, { useCallback, useEffect, useMemo } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import { useThreads } from "@/features/thread/providers/thread-provider";
import { StreamContext } from "./stream-context";
import { StreamSessionProps } from "./types";
import { LoadingScreen } from "@/shared/components/loading-spinner";
import { useObservability } from "@/core/services/observability";
import * as Sentry from "@sentry/react";
import { useStreamToken } from "./hooks/use-stream-token";
import { useThreadVerification } from "./hooks/use-thread-verification";
import { useGraphStatus } from "./hooks/use-graph-status";
import { useStreamSetup } from "./hooks/use-stream-setup";
import { TokenErrorScreen } from "./components/token-error-screen";

export const StreamSession: React.FC<StreamSessionProps> = ({
  children,
  apiUrl,
  assistantId,
}) => {
  const handleLoginRedirect = useCallback(() => {
    window.location.href = "/auth/login";
  }, []);

  const [threadId, setThreadId] = useSearchParamState("threadId");
  const { getThreads, setThreads, removeOptimisticThread } = useThreads();

  const baseLogger = useObservability();
  const logger = useMemo(
    () =>
      baseLogger.child({
        component: "StreamSession",
        additionalData: {
          assistantId,
          apiUrl,
        },
      }),
    [baseLogger, assistantId, apiUrl],
  );

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
    setThreads,
    removeOptimisticThread,
    logger,
  });

  useGraphStatus({ apiUrl, logger });

  const extendedStreamValue = useStreamSetup({
    apiUrl,
    assistantId,
    threadId,
    accessToken,
    verifyThreadCreation,
    setThreadId,
  });

  if (isUserLoading || (!accessToken && !tokenError && user)) {
    return (
      <StreamContext.Provider value={extendedStreamValue}>
        <LoadingScreen />
      </StreamContext.Provider>
    );
  }

  if (tokenError) {
    return (
      <StreamContext.Provider value={extendedStreamValue}>
        <TokenErrorScreen
          error={tokenError}
          onLoginRedirect={handleLoginRedirect}
        />
      </StreamContext.Provider>
    );
  }

  return (
    <StreamContext.Provider value={extendedStreamValue}>
      {children}
    </StreamContext.Provider>
  );
};
