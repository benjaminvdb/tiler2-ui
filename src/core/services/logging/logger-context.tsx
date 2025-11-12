import React, { createContext, useContext, useMemo, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSearchParamState } from "@/core/routing/hooks";
import { createLogger } from "./logger";
import { ILogger, LogContext } from "./types";
import { getLogger } from "./logger";

/**
 * Logger context for React components
 * Automatically injects user and thread context
 */
const LoggerContext = createContext<ILogger | null>(null);

interface LoggerProviderProps {
  children: ReactNode;
  additionalContext?: LogContext;
}

/**
 * Provider that creates a logger with automatic context injection
 * Place this high in your component tree to provide logger to all children
 */
export function LoggerProvider({
  children,
  additionalContext = {},
}: LoggerProviderProps): React.JSX.Element {
  const { user } = useAuth0();
  const [threadId] = useSearchParamState("threadId");

  const logger = useMemo(() => {
    const context: LogContext = {
      ...additionalContext,
      ...(user?.sub ? { userId: user.sub } : {}),
      ...(threadId ? { threadId } : {}),
    };

    return createLogger(context);
  }, [user?.sub, threadId, additionalContext]);

  return (
    <LoggerContext.Provider value={logger}>{children}</LoggerContext.Provider>
  );
}

/**
 * Hook to get the logger from context
 * Use this in React components
 *
 * @example
 * const logger = useLogger();
 * logger.info("User clicked button", { operation: "button_click" });
 */
export function useLogger(): ILogger {
  const logger = useContext(LoggerContext);

  if (!logger) {
    // Fallback to global logger if not in provider
    // This shouldn't happen in normal usage but provides safety
    if (import.meta.env.MODE === "development") {
      console.warn(
        "useLogger() called outside LoggerProvider. Using global logger as fallback.",
      );
    }
    return getLogger();
  }

  return logger;
}
