import { ILogger, LogContext } from "./types";

/**
 * Create a logger instance
 * Automatically selects server (Pino) or client (Sentry) implementation
 */
export function createLogger(context?: LogContext): ILogger {
  if (typeof window === "undefined") {
    // Server-side: use Pino
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createServerLogger } = require("./server-logger");
    return createServerLogger(context);
  } else {
    // Client-side: use Sentry wrapper
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ClientLogger } = require("./client-logger");
    return new ClientLogger(context);
  }
}

/**
 * Global logger instance for app-wide usage
 */
let appLogger: ILogger | null = null;

/**
 * Get the global logger instance
 * Creates one if it doesn't exist
 *
 * Use this for server-side API routes, middleware, etc.
 * For React components, use useLogger() hook instead
 */
export function getLogger(): ILogger {
  if (!appLogger) {
    appLogger = createLogger();
  }
  return appLogger;
}
