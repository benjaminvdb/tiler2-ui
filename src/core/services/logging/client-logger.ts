import * as Sentry from "@sentry/react";
import { ILogger, LogContext, LogLevel } from "./types";
import { redactSensitiveData } from "./filters";

/**
 * Client-side logger using Sentry APIs directly
 * Maintains same interface as server-side for consistency
 */

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Map log level to Sentry severity level
 */
function mapToSentryLevel(level: LogLevel): Sentry.SeverityLevel {
  switch (level) {
    case "debug":
      return "debug";
    case "info":
      return "info";
    case "warn":
      return "warning";
    case "error":
      return "error";
    case "fatal":
      return "fatal";
    default:
      return "info";
  }
}

export class ClientLogger implements ILogger {
  private baseContext: LogContext;

  constructor(context?: LogContext) {
    this.baseContext = context || {};
  }

  private sanitizeContext(context?: LogContext): LogContext {
    const merged = {
      ...this.baseContext,
      ...context,
    };
    return redactSensitiveData(merged) as LogContext;
  }

  private log(
    level: LogLevel,
    msg: string | Error,
    context?: LogContext,
  ): void {
    const sanitized = this.sanitizeContext(context);

    // In development, only log to console (skip Sentry)
    if (isDevelopment) {
      const consoleMethod = level === "fatal" ? "error" : level;
      console[consoleMethod](`[${level.toUpperCase()}]`, msg, sanitized);
      return;
    }

    // Production: send to Sentry
    const sentryLevel = mapToSentryLevel(level);

    // Extract tags for better filtering in Sentry
    const tags: Record<string, string> = {};
    if (sanitized.operation) tags.operation = String(sanitized.operation);
    if (sanitized.component) tags.component = String(sanitized.component);

    // Decide whether to send as error or message
    if (level === "error" || level === "fatal") {
      const error = msg instanceof Error ? msg : new Error(String(msg));
      Sentry.captureException(error, {
        level: sentryLevel,
        tags,
        contexts: {
          log: sanitized,
        },
      });
    } else {
      Sentry.captureMessage(String(msg), {
        level: sentryLevel,
        tags,
        contexts: {
          log: sanitized,
        },
      });
    }
  }

  debug(msg: string, context?: LogContext): void {
    // Debug logs only in development
    if (isDevelopment) {
      console.debug("[DEBUG]", msg, this.sanitizeContext(context));
    }
  }

  info(msg: string, context?: LogContext): void {
    this.log("info", msg, context);
  }

  warn(msg: string, context?: LogContext): void {
    this.log("warn", msg, context);
  }

  error(msg: string | Error, context?: LogContext): void {
    this.log("error", msg, context);
  }

  fatal(msg: string | Error, context?: LogContext): void {
    this.log("fatal", msg, context);
  }

  child(context: LogContext): ILogger {
    const mergedContext = {
      ...this.baseContext,
      ...context,
    };
    return new ClientLogger(mergedContext);
  }
}
