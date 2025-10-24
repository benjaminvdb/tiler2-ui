/**
 * Standard log levels matching Pino and Sentry
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Context that can be attached to any log entry
 * Automatically enriched with user/thread/assistant when available
 */
export interface LogContext {
  // Auto-injected by providers
  userId?: string;
  threadId?: string;
  assistantId?: string;

  // Optional metadata
  operation?: string;
  component?: string;
  duration?: number;
  statusCode?: number;

  // Allow any additional fields
  [key: string]: unknown;
}

/**
 * Unified logger interface for both client and server
 */
export interface ILogger {
  /**
   * Log debug information (development only)
   */
  debug(msg: string, context?: LogContext): void;

  /**
   * Log informational messages
   */
  info(msg: string, context?: LogContext): void;

  /**
   * Log warnings (potential issues)
   */
  warn(msg: string, context?: LogContext): void;

  /**
   * Log errors (handled exceptions)
   */
  error(msg: string | Error, context?: LogContext): void;

  /**
   * Log fatal errors (unrecoverable)
   */
  fatal(msg: string | Error, context?: LogContext): void;

  /**
   * Create a child logger with additional context
   * Useful for adding component/operation context
   */
  child(context: LogContext): ILogger;
}
