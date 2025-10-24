import pino from "pino";
import { ILogger, LogContext, LogLevel } from "./types";

/**
 * Server-side logger using Pino with built-in redaction
 * High-performance, async, JSON-native logging
 */

// Get log level from environment or default to info
const logLevel = (process.env.LOG_LEVEL || "info") as LogLevel;
const isDevelopment = process.env.NODE_ENV === "development";
const usePretty = isDevelopment && process.env.LOG_PRETTY !== "false";

// Sensitive field paths to redact using Pino's built-in redaction
// This is more performant and comprehensive than manual filtering
const REDACT_PATHS = [
  // Direct fields
  "password",
  "token",
  "secret",
  "apikey",
  "api_key",
  "apiKey",
  "authorization",
  "auth",
  "cookie",
  "session",
  "jwt",
  "bearer",
  "access_token",
  "accessToken",
  "refresh_token",
  "refreshToken",
  "private_key",
  "privateKey",
  "client_secret",
  "clientSecret",
  "auth0_secret",
  "AUTH0_SECRET",
  "email", // Redact emails for privacy

  // Nested paths (Pino supports wildcard patterns)
  "*.password",
  "*.token",
  "*.secret",
  "*.apikey",
  "*.api_key",
  "*.apiKey",
  "*.authorization",
  "*.auth",
  "*.cookie",
  "*.session",
  "*.jwt",
  "*.bearer",
  "*.access_token",
  "*.accessToken",
  "*.refresh_token",
  "*.refreshToken",
  "*.email",

  // Headers
  "headers.authorization",
  "headers.Authorization",
  "headers.cookie",
  "headers.Cookie",

  // Request/response
  "req.headers.authorization",
  "req.headers.cookie",
  "res.headers.authorization",
  "res.headers.cookie",
];

// Create base Pino logger with redaction
const createPinoLogger = () => {
  const baseConfig: pino.LoggerOptions = {
    level: logLevel,

    // Redact sensitive fields using Pino's built-in functionality
    redact: {
      paths: REDACT_PATHS,
      censor: "[REDACTED]", // What to replace sensitive data with
      remove: false, // Keep the keys, just redact values
    },

    formatters: {
      level: (label) => {
        return { level: label };
      },
    },

    base: {
      env: process.env.NODE_ENV,
    },

    // Custom serializers for error objects
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
    },
  };

  // Add transport only if pretty printing is enabled
  if (usePretty) {
    return pino({
      ...baseConfig,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
          singleLine: false,
        },
      },
    });
  }

  return pino(baseConfig);
};

const pinoLogger = createPinoLogger();

/**
 * Wrapper class to implement ILogger interface with Pino
 */
class PinoLogger implements ILogger {
  constructor(private logger: pino.Logger) {}

  debug(msg: string, context?: LogContext): void {
    this.logger.debug(context || {}, msg);
  }

  info(msg: string, context?: LogContext): void {
    this.logger.info(context || {}, msg);
  }

  warn(msg: string, context?: LogContext): void {
    this.logger.warn(context || {}, msg);
  }

  error(msg: string | Error, context?: LogContext): void {
    if (msg instanceof Error) {
      this.logger.error({ ...context, err: msg }, msg.message);
    } else {
      this.logger.error(context || {}, msg);
    }
  }

  fatal(msg: string | Error, context?: LogContext): void {
    if (msg instanceof Error) {
      this.logger.fatal({ ...context, err: msg }, msg.message);
    } else {
      this.logger.fatal(context || {}, msg);
    }
  }

  child(context: LogContext): ILogger {
    return new PinoLogger(this.logger.child(context));
  }
}

/**
 * Create a server-side logger instance
 */
export function createServerLogger(context?: LogContext): ILogger {
  if (context) {
    return new PinoLogger(pinoLogger.child(context));
  }
  return new PinoLogger(pinoLogger);
}
