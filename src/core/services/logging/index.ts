/**
 * Structured logging service
 *
 * Usage:
 * - React components: useLogger() hook
 * - Server/API routes: getLogger() function
 * - Child loggers: logger.child({ component: "MyComponent" })
 */

export { createLogger, getLogger } from "./logger";
export { useLogger, LoggerProvider } from "./logger-context";
export type { ILogger, LogContext, LogLevel } from "./types";
export { redactSensitiveData, containsSensitiveData } from "./filters";
