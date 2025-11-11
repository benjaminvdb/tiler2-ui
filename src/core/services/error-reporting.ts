/**
 * Comprehensive error reporting and logging system
 * Handles development logging, production monitoring, and user feedback
 * Integrates with Sentry for production error monitoring
 */

import * as Sentry from "@sentry/react";

// Error severity levels
export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// Error category for better organization
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

// Error context interface
export interface ErrorContext {
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
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  stack?: string;
  originalError?: Error;
  timestamp: number;
  environment: string;
}

// Error reporting configuration
interface ErrorReportingConfig {
  enableConsoleLogging: boolean;
  enableUserNotification: boolean;
  enableRemoteLogging: boolean;
  enablePerformanceTracking: boolean;
  maxErrorsPerSession: number;
  remoteEndpoint?: string;
  apiKey?: string;
}

// Default configuration
const defaultConfig: ErrorReportingConfig = {
  enableConsoleLogging: true,
  enableUserNotification: true,
  enableRemoteLogging: false,
  enablePerformanceTracking: true,
  maxErrorsPerSession: 100,
};

// Environment-specific configuration
const getConfig = (): ErrorReportingConfig => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  return {
    ...defaultConfig,
    enableConsoleLogging:
      isDevelopment || Boolean(process.env.ENABLE_ERROR_CONSOLE_LOGGING),
    enableRemoteLogging:
      isProduction && Boolean(process.env.ERROR_REPORTING_ENDPOINT),
    ...(process.env.ERROR_REPORTING_ENDPOINT
      ? { remoteEndpoint: process.env.ERROR_REPORTING_ENDPOINT }
      : {}),
    ...(process.env.ERROR_REPORTING_API_KEY
      ? { apiKey: process.env.ERROR_REPORTING_API_KEY }
      : {}),
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
const getEnvironmentContext = (): Partial<ErrorContext> => {
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

// Format error for console output
const formatErrorForConsole = (structuredError: StructuredError): string => {
  const { id, message, severity, category, context, stack } = structuredError;

  return [
    `🚨 Error [${severity.toUpperCase()}] - ${category}`,
    `ID: ${id}`,
    `Message: ${message}`,
    `Context: ${JSON.stringify(context, null, 2)}`,
    ...(stack ? [`Stack: ${stack}`] : []),
  ].join("\n");
};

// Map error severity to Sentry level
const mapSeverityToSentryLevel = (
  severity: ErrorSeverity,
): Sentry.SeverityLevel => {
  switch (severity) {
    case "critical":
      return "fatal";
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "info";
    default:
      return "error";
  }
};

// Send error to Sentry
const sendToSentry = (structuredError: StructuredError): void => {
  try {
    const { originalError, message, severity, category, context } =
      structuredError;

    // Use the original error if available, otherwise create a new one
    const errorToSend = originalError || new Error(message || "Unknown error");

    // Capture in Sentry with full context
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
      message: message || "Error occurred",
      level: mapSeverityToSentryLevel(severity),
      data: {
        errorId: structuredError.id,
        ...context,
      },
    });
  } catch (error) {
    // Silently fail Sentry reporting to avoid recursive errors
    console.warn("Failed to send error to Sentry:", error);
  }
};

// Send error to remote monitoring service (legacy support)
const sendToRemoteService = async (
  structuredError: StructuredError,
): Promise<void> => {
  if (!config.enableRemoteLogging || !config.remoteEndpoint) {
    return;
  }

  try {
    const response = await fetch(config.remoteEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
      body: JSON.stringify({
        error: structuredError,
        environment: process.env.NODE_ENV,
        app: "agent-chat-ui",
      }),
    });

    if (!response.ok) {
      console.warn("Failed to send error to remote service:", response.status);
    }
  } catch (error) {
    console.warn("Error sending to remote service:", error);
  }
};

// Show user notification (integrate with existing toast system)
const showUserNotification = (structuredError: StructuredError): void => {
  if (!config.enableUserNotification) {
    return;
  }

  // For client-side only
  if (typeof window === "undefined") {
    return;
  }

  // Dynamic import to avoid SSR issues
  import("sonner")
    .then(({ toast }) => {
      const { severity, message, category } = structuredError;

      switch (severity) {
        case "critical":
          toast.error("Critical Error", {
            description: `${message} (${category})`,
            duration: 0, // Persistent
          });
          break;
        case "high":
          toast.error("Error", {
            description: message,
            duration: 8000,
          });
          break;
        case "medium":
          toast.warning("Warning", {
            description: message,
            duration: 5000,
          });
          break;
        case "low":
          toast.info("Notice", {
            description: message,
            duration: 3000,
          });
          break;
      }
    })
    .catch(() => {
      // Fallback if sonner is not available
      console.warn("User notification failed - sonner not available");
    });
};

// Main error reporting function
export const reportError = (
  error: Error | string,
  severity: ErrorSeverity = "medium",
  category: ErrorCategory = "unknown",
  context: ErrorContext = {},
): StructuredError => {
  // Prevent error spam
  if (errorCount >= config.maxErrorsPerSession) {
    return {
      id: "max-errors-exceeded",
      message: "Maximum errors per session exceeded",
      severity: "critical",
      category: "system",
      context: {},
      timestamp: Date.now(),
      environment: process.env.NODE_ENV || "unknown",
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
    environment: process.env.NODE_ENV || "unknown",
  };

  // Store in history
  errorHistory.push(structuredError);

  // Console logging
  if (config.enableConsoleLogging) {
    const consoleMethod =
      severity === "critical"
        ? "error"
        : severity === "high"
          ? "error"
          : severity === "medium"
            ? "warn"
            : "info";
    console[consoleMethod](formatErrorForConsole(structuredError));
  }

  // User notification (skip if explicitly requested)
  if (!context.skipNotification) {
    showUserNotification(structuredError);
  }

  // Send to Sentry (client-side only)
  if (typeof window !== "undefined") {
    sendToSentry(structuredError);
  }

  // Remote logging (legacy, fire and forget)
  if (config.enableRemoteLogging) {
    sendToRemoteService(structuredError).catch(() => {
      // Silently fail remote logging to avoid recursive errors
    });
  }

  return structuredError;
};

// Convenience functions for different error types
export const reportAuthError = (
  error: Error | string,
  context?: ErrorContext,
): StructuredError => reportError(error, "high", "auth", context);

export const reportApiError = (
  error: Error | string,
  context?: ErrorContext,
): StructuredError => reportError(error, "medium", "api", context);

export const reportValidationError = (
  error: Error | string,
  context?: ErrorContext,
): StructuredError => reportError(error, "low", "validation", context);

export const reportUiError = (
  error: Error | string,
  context?: ErrorContext,
): StructuredError => reportError(error, "medium", "ui", context);

export const reportStreamError = (
  error: Error | string,
  context?: ErrorContext,
): StructuredError => reportError(error, "high", "stream", context);

export const reportThreadError = (
  error: Error | string,
  context?: ErrorContext,
): StructuredError => reportError(error, "high", "thread", context);

export const reportFileUploadError = (
  error: Error | string,
  context?: ErrorContext,
): StructuredError => reportError(error, "medium", "file-upload", context);

export const reportStorageError = (
  error: Error | string,
  context?: ErrorContext,
): StructuredError => reportError(error, "low", "storage", context);

export const reportNetworkError = (
  error: Error | string,
  context?: ErrorContext,
): StructuredError => reportError(error, "medium", "network", context);

/**
 * Report when all retry attempts have been exhausted.
 * Shows user notification with retry action and sends to Sentry with special tags.
 */
export const reportRetryExhausted = (
  error: Error | string,
  context: ErrorContext & {
    attempts: number;
    url?: string;
  },
): StructuredError => {
  const structuredError: StructuredError = {
    id: generateErrorId(),
    message: error instanceof Error ? error.message : String(error),
    severity: "high", // Retry exhaustion is high severity
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
    environment: process.env.NODE_ENV || "unknown",
  };

  // Store in history
  errorHistory.push(structuredError);

  // Console logging
  if (config.enableConsoleLogging) {
    console.error(formatErrorForConsole(structuredError));
  }

  // Send to Sentry with special tags for retry exhaustion (client-side only)
  if (typeof window !== "undefined") {
    const errorToSend =
      error instanceof Error ? error : new Error(String(error));

    Sentry.captureException(errorToSend, {
      level: "error",
      tags: {
        category: "network",
        severity: "high",
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
  context?: ErrorContext,
): StructuredError => reportError(error, "critical", "unknown", context);

// Error boundary integration
export const reportErrorBoundary = (
  error: Error,
  errorInfo: { componentStack: string },
): StructuredError =>
  reportError(error, "high", "ui", {
    component: "ErrorBoundary",
    additionalData: { componentStack: errorInfo.componentStack },
  });

// Performance tracking
export const trackPerformance = (
  operation: string,
  duration: number,
  context?: ErrorContext,
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
      "low",
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
  context?: ErrorContext,
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      reportError(error as Error, "medium", category, context);
      return null;
    }
  };
};

// Get error statistics
export const getErrorStats = (): {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
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
    {} as Record<ErrorSeverity, number>,
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

// Validate error reporting configuration
export const validateErrorReportingConfig = (): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (config.enableRemoteLogging && !config.remoteEndpoint) {
    errors.push("Remote logging enabled but no endpoint configured");
  }

  if (config.maxErrorsPerSession < 1) {
    errors.push("Maximum errors per session must be at least 1");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
