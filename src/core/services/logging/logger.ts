import { ILogger, LogContext } from "./types";
import { ClientLogger } from "./client-logger";

/**
 * Create a logger instance
 * Uses Sentry-based client-side logging
 */
export function createLogger(context?: LogContext): ILogger {
  return new ClientLogger(context);
}

/**
 * Global logger instance for app-wide usage
 */
let appLogger: ILogger | null = null;

/**
 * Get the global logger instance
 * Creates one if it doesn't exist
 *
 * For React components, prefer useLogger() hook instead
 */
export function getLogger(): ILogger {
  if (!appLogger) {
    appLogger = createLogger();
  }
  return appLogger;
}
