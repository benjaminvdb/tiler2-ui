/**
 * Unified observability client for logging and error reporting
 * Combines structured logging with comprehensive error tracking
 * Integrates with Sentry for production monitoring
 */

import * as Sentry from "@sentry/react";
import type {
  ErrorCategory,
  ILogger,
  ObservabilityConfig,
  ObservabilityContext,
  Severity,
  StructuredError,
} from "./types";
import { redactSensitiveData } from "./filters";

// Default configuration
const defaultConfig: ObservabilityConfig = {
  enableConsoleLogging: true,
  enableUserNotification: true,
  enablePerformanceTracking: true,
  maxErrorsPerSession: 100,
};

// Environment-specific configuration
const getConfig = (): ObservabilityConfig => {
  const isDevelopment = import.meta.env.MODE === "development";

  return {
    ...defaultConfig,
    enableConsoleLogging:
      isDevelopment ||
      Boolean(import.meta.env.VITE_ENABLE_ERROR_CONSOLE_LOGGING),
  };
};

// Error tracking state
let errorCount = 0;
let errorHistory: StructuredError[] = [];
const config = getConfig();

// Generate unique error ID
const generateErrorId = (): string => {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get current environment context
const getEnvironmentContext = (): Partial<ObservabilityContext> => {
  if (typeof window !== "undefined") {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };
  }
  return {
    timestamp: Date.now(),
  };
};

// Map severity to Sentry level
const mapSeverityToSentryLevel = (severity: Severity): Sentry.SeverityLevel => {
  switch (severity) {
    case "fatal":
      return "fatal";
    case "error":
      return "error";
    case "warn":
      return "warning";
    case "info":
      return "info";
    case "debug":
      return "debug";
    default:
      return "error";
  }
};

// Format error for console output
const formatForConsole = (
  severity: Severity,
  message: string,
  context?: ObservabilityContext,
): string => {
  const emoji = {
    fatal: "💀",
    error: "🚨",
    warn: "⚠️",
    info: "ℹ️",
    debug: "🔍",
  }[severity];

  return [
    `${emoji} [${severity.toUpperCase()}] ${message}`,
    ...(context ? [`Context: ${JSON.stringify(context, null, 2)}`] : []),
  ].join("\n");
};

// Show user notification (integrate with toast system)
const showUserNotification = (
  severity: Severity,
  message: string,
  category?: ErrorCategory,
): void => {
  if (!config.enableUserNotification || typeof window === "undefined") {
    return;
  }

  // Dynamic import to avoid SSR issues
  import("sonner")
    .then(({ toast }) => {
      switch (severity) {
        case "fatal":
          toast.error("Critical Error", {
            description: `${message}${category ? ` (${category})` : ""}`,
            duration: 0, // Persistent
          });
          break;
        case "error":
          toast.error("Error", {
            description: message,
            duration: 8000,
          });
          break;
        case "warn":
          toast.warning("Warning", {
            description: message,
            duration: 5000,
          });
          break;
        case "info":
          toast.info("Notice", {
            description: message,
            duration: 3000,
          });
          break;
        // debug doesn't show toast
      }
    })
    .catch(() => {
      console.warn("User notification failed - sonner not available");
    });
};

/**
 * ObservabilityClient - Unified logging and error tracking
 */
class ObservabilityClient implements ILogger {
  private context: ObservabilityContext;

  constructor(context: ObservabilityContext = {}) {
    this.context = context;
  }

  /**
   * Create a child logger with merged context
   */
  child(context: ObservabilityContext): ILogger {
    return new ObservabilityClient({
      ...this.context,
      ...context,
    });
  }

  /**
   * Debug logging - lightweight breadcrumbs only (dev mode + Sentry)
   */
  debug(message: string, context?: ObservabilityContext): void {
    const mergedContext = { ...this.context, ...context };
    const sanitizedContext = redactSensitiveData(mergedContext) as Record<
      string,
      unknown
    >;

    // Only log to console in development
    if (config.enableConsoleLogging && import.meta.env.MODE === "development") {
      console.debug(
        formatForConsole(
          "debug",
          message,
          sanitizedContext as ObservabilityContext,
        ),
      );
    }

    // Add breadcrumb to Sentry (client-side only)
    if (typeof window !== "undefined") {
      Sentry.addBreadcrumb({
        category: (sanitizedContext.component as string) || "app",
        message,
        level: "debug",
        data: sanitizedContext,
      });
    }
  }

  /**
   * Info logging - breadcrumbs for context trail
   */
  info(message: string, context?: ObservabilityContext): void {
    const mergedContext = { ...this.context, ...context };
    const sanitizedContext = redactSensitiveData(mergedContext) as Record<
      string,
      unknown
    >;

    if (config.enableConsoleLogging) {
      console.info(
        formatForConsole(
          "info",
          message,
          sanitizedContext as ObservabilityContext,
        ),
      );
    }

    // Add breadcrumb to Sentry (client-side only)
    if (typeof window !== "undefined") {
      Sentry.addBreadcrumb({
        category: (sanitizedContext.component as string) || "app",
        message,
        level: "info",
        data: sanitizedContext,
      });
    }
  }

  /**
   * Warning logging - breadcrumbs + optional toast
   */
  warn(message: string, context?: ObservabilityContext): void {
    const mergedContext = { ...this.context, ...context };
    const sanitizedContext = redactSensitiveData(mergedContext) as Record<
      string,
      unknown
    >;

    if (config.enableConsoleLogging) {
      console.warn(
        formatForConsole(
          "warn",
          message,
          sanitizedContext as ObservabilityContext,
        ),
      );
    }

    // Add breadcrumb to Sentry (client-side only)
    if (typeof window !== "undefined") {
      Sentry.addBreadcrumb({
        category: (sanitizedContext.component as string) || "app",
        message,
        level: "warning",
        data: sanitizedContext,
      });
    }
  }

  /**
   * Error logging - captures exception in Sentry
   */
  error(error: Error | string, context?: ObservabilityContext): void {
    const mergedContext = {
      ...getEnvironmentContext(),
      ...this.context,
      ...context,
    };
    const sanitizedContext = redactSensitiveData(mergedContext) as Record<
      string,
      unknown
    >;
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (config.enableConsoleLogging) {
      console.error(
        formatForConsole(
          "error",
          errorMessage,
          sanitizedContext as ObservabilityContext,
        ),
      );
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
    }

    // Send to Sentry (client-side only)
    if (typeof window !== "undefined") {
      const errorToSend =
        error instanceof Error ? error : new Error(String(error));

      // Build tags object
      const tags: Record<string, string> = {};
      if (sanitizedContext.operation) {
        tags.operation = sanitizedContext.operation as string;
      }
      if (sanitizedContext.component) {
        tags.component = sanitizedContext.component as string;
      }

      Sentry.captureException(errorToSend, {
        level: "error",
        tags,
        contexts: {
          observability: sanitizedContext,
        },
        extra: sanitizedContext.additionalData as Record<string, unknown>,
      });
    }
  }

  /**
   * Fatal error logging - captures exception with fatal severity
   */
  fatal(error: Error | string, context?: ObservabilityContext): void {
    const mergedContext = {
      ...getEnvironmentContext(),
      ...this.context,
      ...context,
    };
    const sanitizedContext = redactSensitiveData(mergedContext) as Record<
      string,
      unknown
    >;
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (config.enableConsoleLogging) {
      console.error(
        formatForConsole(
          "fatal",
          errorMessage,
          sanitizedContext as ObservabilityContext,
        ),
      );
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
    }

    // Send to Sentry (client-side only)
    if (typeof window !== "undefined") {
      const errorToSend =
        error instanceof Error ? error : new Error(String(error));

      // Build tags object
      const tags: Record<string, string> = {};
      if (sanitizedContext.operation) {
        tags.operation = sanitizedContext.operation as string;
      }
      if (sanitizedContext.component) {
        tags.component = sanitizedContext.component as string;
      }

      Sentry.captureException(errorToSend, {
        level: "fatal",
        tags,
        contexts: {
          observability: sanitizedContext,
        },
        extra: sanitizedContext.additionalData as Record<string, unknown>,
      });
    }
  }
}

// Singleton instance
const globalObservability = new ObservabilityClient();

/**
 * Get the global observability client
 */
export function getObservability(): ILogger {
  return globalObservability;
}

/**
 * Create a new observability client with context
 */
export function createObservability(context?: ObservabilityContext): ILogger {
  return new ObservabilityClient(context);
}

// Export singleton for direct usage
export const observability = globalObservability;

/**
 * Main error reporting function (backward compatibility)
 */
export const reportError = (
  error: Error | string,
  severity: Severity = "error",
  category: ErrorCategory = "unknown",
  context: ObservabilityContext = {},
): StructuredError => {
  // Prevent error spam
  if (errorCount >= config.maxErrorsPerSession) {
    return {
      id: "max-errors-exceeded",
      message: "Maximum errors per session exceeded",
      severity: "fatal",
      category: "system",
      context: {},
      timestamp: Date.now(),
      environment: import.meta.env.MODE || "unknown",
    };
  }

  errorCount++;

  // Create structured error
  const structuredError: StructuredError = {
    id: generateErrorId(),
    message: error instanceof Error ? error.message : String(error),
    severity,
    category,
    context: {
      ...getEnvironmentContext(),
      ...context,
    },
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
    ...(error instanceof Error ? { originalError: error } : {}),
    timestamp: Date.now(),
    environment: import.meta.env.MODE || "unknown",
  };

  // Store in history
  errorHistory.push(structuredError);

  // Console logging
  if (config.enableConsoleLogging) {
    const consoleMethod =
      severity === "fatal" || severity === "error"
        ? "error"
        : severity === "warn"
          ? "warn"
          : "info";
    console[consoleMethod](
      formatForConsole(
        severity,
        structuredError.message,
        structuredError.context,
      ),
    );
  }

  // User notification (skip if explicitly requested)
  if (!context.skipNotification) {
    showUserNotification(severity, structuredError.message, category);
  }

  // Send to Sentry (client-side only)
  if (typeof window !== "undefined") {
    const errorToSend =
      error instanceof Error ? error : new Error(structuredError.message);

    Sentry.captureException(errorToSend, {
      level: mapSeverityToSentryLevel(severity),
      tags: {
        category,
        severity,
        errorId: structuredError.id,
        ...(context.operation && { operation: context.operation }),
        ...(context.component && { component: context.component }),
      },
      contexts: {
        error: {
          id: structuredError.id,
          timestamp: structuredError.timestamp,
          environment: structuredError.environment,
        },
        ...(context.threadId && {
          thread: {
            id: context.threadId,
          },
        }),
        ...(context.userId && {
          user: {
            id: context.userId,
          },
        }),
      },
      extra: {
        ...context.additionalData,
        url: context.url,
        userAgent: context.userAgent,
      },
    });

    // Add breadcrumb for the error
    Sentry.addBreadcrumb({
      category,
      message: structuredError.message,
      level: mapSeverityToSentryLevel(severity),
      data: {
        errorId: structuredError.id,
        ...context,
      },
    });
  }

  return structuredError;
};

// Convenience functions for different error types
export const reportAuthError = (
  error: Error | string,
  context?: ObservabilityContext,
): StructuredError => reportError(error, "error", "auth", context);

export const reportApiError = (
  error: Error | string,
  context?: ObservabilityContext,
): StructuredError => reportError(error, "warn", "api", context);

export const reportValidationError = (
  error: Error | string,
  context?: ObservabilityContext,
): StructuredError => reportError(error, "info", "validation", context);

export const reportUiError = (
  error: Error | string,
  context?: ObservabilityContext,
): StructuredError => reportError(error, "warn", "ui", context);

export const reportStreamError = (
  error: Error | string,
  context?: ObservabilityContext,
): StructuredError => reportError(error, "error", "stream", context);

export const reportThreadError = (
  error: Error | string,
  context?: ObservabilityContext,
): StructuredError => reportError(error, "error", "thread", context);

export const reportFileUploadError = (
  error: Error | string,
  context?: ObservabilityContext,
): StructuredError => reportError(error, "warn", "file-upload", context);

export const reportStorageError = (
  error: Error | string,
  context?: ObservabilityContext,
): StructuredError => reportError(error, "info", "storage", context);

export const reportNetworkError = (
  error: Error | string,
  context?: ObservabilityContext,
): StructuredError => reportError(error, "warn", "network", context);

/**
 * Report when all retry attempts have been exhausted.
 * Shows user notification with retry action and sends to Sentry with special tags.
 */
export const reportRetryExhausted = (
  error: Error | string,
  context: ObservabilityContext & {
    attempts: number;
    url?: string;
  },
): StructuredError => {
  const structuredError: StructuredError = {
    id: generateErrorId(),
    message: error instanceof Error ? error.message : String(error),
    severity: "error",
    category: "network",
    context: {
      ...getEnvironmentContext(),
      ...context,
      additionalData: {
        ...context.additionalData,
        retryExhausted: true,
      },
    },
    ...(error instanceof Error && error.stack ? { stack: error.stack } : {}),
    ...(error instanceof Error ? { originalError: error } : {}),
    timestamp: Date.now(),
    environment: import.meta.env.MODE || "unknown",
  };

  // Store in history
  errorHistory.push(structuredError);

  // Console logging
  if (config.enableConsoleLogging) {
    console.error(
      formatForConsole(
        "error",
        structuredError.message,
        structuredError.context,
      ),
    );
  }

  // Send to Sentry with special tags for retry exhaustion (client-side only)
  if (typeof window !== "undefined") {
    const errorToSend =
      error instanceof Error ? error : new Error(String(error));

    Sentry.captureException(errorToSend, {
      level: "error",
      tags: {
        category: "network",
        severity: "error",
        retry_exhausted: "true",
        attempts: context.attempts.toString(),
        errorId: structuredError.id,
        ...(context.operation && { operation: context.operation }),
        ...(context.component && { component: context.component }),
      },
      contexts: {
        error: {
          id: structuredError.id,
          timestamp: structuredError.timestamp,
          environment: structuredError.environment,
        },
        retry: {
          attempts: context.attempts,
          url: context.url,
        },
      },
      extra: {
        ...context.additionalData,
        url: context.url,
        userAgent: context.userAgent,
      },
    });
  }

  // User notification with retry action (unless explicitly skipped)
  if (!context.skipNotification && typeof window !== "undefined") {
    import("sonner")
      .then(({ toast }) => {
        toast.error(
          `Operation failed after ${context.attempts} attempts. Please try again.`,
          {
            duration: 8000,
            action: {
              label: "Retry",
              onClick: () => window.location.reload(),
            },
          },
        );
      })
      .catch(() => {
        console.warn("User notification failed - sonner not available");
      });
  }

  return structuredError;
};

export const reportCriticalError = (
  error: Error | string,
  context?: ObservabilityContext,
): StructuredError => reportError(error, "fatal", "unknown", context);

// Error boundary integration
export const reportErrorBoundary = (
  error: Error,
  errorInfo: { componentStack: string },
): StructuredError =>
  reportError(error, "error", "ui", {
    component: "ErrorBoundary",
    additionalData: { componentStack: errorInfo.componentStack },
  });

// Performance tracking
export const trackPerformance = (
  operation: string,
  duration: number,
  context?: ObservabilityContext,
): void => {
  if (!config.enablePerformanceTracking) {
    return;
  }

  // Send performance metrics to Sentry
  if (typeof window !== "undefined") {
    Sentry.addBreadcrumb({
      category: "performance",
      message: `${operation} completed`,
      level: duration > 5000 ? "warning" : "info",
      data: {
        operation,
        duration,
        ...context,
      },
    });
  }

  if (duration > 5000) {
    // Log slow operations (>5s)
    reportError(
      `Slow operation detected: ${operation} took ${duration}ms`,
      "info",
      "unknown",
      {
        operation,
        ...context,
        additionalData: { duration, threshold: 5000 },
      },
    );
  }
};

// Utility function to wrap async operations with error handling
export const withErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  category: ErrorCategory = "unknown",
  context?: ObservabilityContext,
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      reportError(error as Error, "warn", category, context);
      return null;
    }
  };
};

// Get error statistics
export const getErrorStats = (): {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<Severity, number>;
  recentErrors: StructuredError[];
} => {
  const errorsByCategory = errorHistory.reduce(
    (acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    },
    {} as Record<ErrorCategory, number>,
  );

  const errorsBySeverity = errorHistory.reduce(
    (acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    },
    {} as Record<Severity, number>,
  );

  return {
    totalErrors: errorCount,
    errorsByCategory,
    errorsBySeverity,
    recentErrors: errorHistory.slice(-10), // Last 10 errors
  };
};

// Clear error history (for testing or privacy)
export const clearErrorHistory = (): void => {
  errorHistory = [];
  errorCount = 0;
};

// Validate observability configuration
export const validateObservabilityConfig = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (config.maxErrorsPerSession < 1) {
    errors.push("Maximum errors per session must be at least 1");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
