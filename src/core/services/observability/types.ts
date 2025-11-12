/**
 * Unified observability type definitions
 * Combines logging and error reporting into a single coherent system
 */

// Severity levels for all observability events
export type Severity = "debug" | "info" | "warn" | "error" | "fatal";

// Error category for better organization and filtering
export type ErrorCategory =
  | "auth"
  | "api"
  | "validation"
  | "ui"
  | "stream"
  | "thread"
  | "file-upload"
  | "storage"
  | "network"
  | "system"
  | "unknown";

// Context interface for all observability events
export interface ObservabilityContext {
  userId?: string;
  threadId?: string;
  operation?: string;
  component?: string;
  url?: string;
  userAgent?: string;
  timestamp?: number;
  additionalData?: Record<string, unknown>;
  /** Skip showing user notification (toast). Still logs to console and Sentry. */
  skipNotification?: boolean;
}

// Structured error interface
export interface StructuredError {
  id: string;
  message: string;
  severity: Severity;
  category: ErrorCategory;
  context: ObservabilityContext;
  stack?: string;
  originalError?: Error;
  timestamp: number;
  environment: string;
}

// Logger interface for typed logging methods
export interface ILogger {
  debug(message: string, context?: ObservabilityContext): void;
  info(message: string, context?: ObservabilityContext): void;
  warn(message: string, context?: ObservabilityContext): void;
  error(error: Error | string, context?: ObservabilityContext): void;
  fatal(error: Error | string, context?: ObservabilityContext): void;
  child(context: ObservabilityContext): ILogger;
}

// Configuration for observability system
export interface ObservabilityConfig {
  enableConsoleLogging: boolean;
  enableUserNotification: boolean;
  enablePerformanceTracking: boolean;
  maxErrorsPerSession: number;
}
