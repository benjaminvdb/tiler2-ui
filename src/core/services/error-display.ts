/**
 * Unified error display system for user-facing error presentation.
 * Coordinates toast notifications, fallback UI, and observability reporting.
 */

import { toast } from "sonner";
import { reportErrorBoundary, observability } from "./observability";

const logger = observability.child({
  component: "error-display",
});

export type ErrorSeverity = "critical" | "error" | "warning" | "info";
export type ErrorContext = "global" | "feature" | "component" | "async";

export interface ErrorDisplayOptions {
  severity: ErrorSeverity;
  context: ErrorContext;
  showToast?: boolean;
  showFallback?: boolean;
  duration?: number;
  actions?: Array<{ label: string; onClick: () => void }>;
  description?: string;
  componentStack?: string;
}

export interface ErrorDisplayResult {
  shouldShowFallback: boolean;
  fallbackType: "global" | "component" | "none";
}

const DEFAULT_DURATIONS: Record<ErrorSeverity, number> = {
  critical: 10000,
  error: 7000,
  warning: 5000,
  info: 3000,
};

const TOAST_TITLES: Record<ErrorSeverity, string> = {
  critical: "Critical Error",
  error: "Error",
  warning: "Warning",
  info: "Information",
};

const getDefaultDescription = (context: ErrorContext, error: Error): string => {
  if (error.name === "AccessTokenError") {
    return "Your session has expired. You will be redirected to login.";
  }

  if (error.name === "ForbiddenError") {
    return "Access denied. Logging you out...";
  }

  switch (context) {
    case "global":
      return "An unexpected error occurred. Please try refreshing the page.";
    case "async":
      return "A network request failed. Please check your connection and try again.";
    case "feature":
      return "This feature encountered an error. Please try again.";
    case "component":
      return "This component failed to load. Please try again.";
    default:
      return error.message || "An unexpected error occurred.";
  }
};

const shouldShowToast = (
  severity: ErrorSeverity,
  context: ErrorContext,
): boolean => {
  if (severity === "critical" || context === "async") return true;
  if (context === "global") return true;
  if (context === "component") return false;
  return true;
};

const shouldShowFallback = (context: ErrorContext): boolean => {
  return context === "global" || context === "component";
};

const getFallbackType = (
  context: ErrorContext,
): "global" | "component" | "none" => {
  switch (context) {
    case "global":
      return "global";
    case "component":
    case "feature":
      return "component";
    case "async":
    default:
      return "none";
  }
};

/**
 * Reports error to observability system
 */
function reportError(
  error: Error,
  severity: ErrorSeverity,
  componentStack?: string,
): void {
  const shouldReport = severity === "critical" || severity === "error";
  if (shouldReport) {
    reportErrorBoundary(error, {
      componentStack: componentStack || "Not available",
    });
  }
}

/**
 * Displays toast notification for error
 */
function showToastNotification(
  severity: ErrorSeverity,
  description: string,
  duration: number,
  actions: Array<{ label: string; onClick: () => void }>,
): void {
  const toastOptions = {
    description,
    duration,
    richColors: true,
    closeButton: true,
    action:
      actions.length > 0
        ? {
            label: actions[0].label,
            onClick: actions[0].onClick,
          }
        : undefined,
  };

  const title = TOAST_TITLES[severity];
  const isErrorSeverity = severity === "critical" || severity === "error";

  if (isErrorSeverity) {
    toast.error(title, toastOptions);
  } else if (severity === "warning") {
    toast.warning(title, toastOptions);
  } else {
    toast.info(title, toastOptions);
  }
}

/**
 * Logs error in development mode
 */
function logErrorInDev(
  error: Error,
  severity: ErrorSeverity,
  context: ErrorContext,
  componentStack?: string,
): void {
  if (import.meta.env.MODE === "development") {
    logger.error(error, {
      operation: "display_error",
      additionalData: {
        severity,
        context,
        ...(componentStack && { componentStack }),
      },
    });
  }
}

export const displayError = (
  error: Error,
  options: ErrorDisplayOptions,
): ErrorDisplayResult => {
  const {
    severity,
    context,
    showToast = shouldShowToast(severity, context),
    showFallback = shouldShowFallback(context),
    duration = DEFAULT_DURATIONS[severity],
    actions = [],
    description = getDefaultDescription(context, error),
    componentStack,
  } = options;

  reportError(error, severity, componentStack);

  if (showToast) {
    showToastNotification(severity, description, duration, actions);
  }

  logErrorInDev(error, severity, context, componentStack);

  return {
    shouldShowFallback: showFallback,
    fallbackType: getFallbackType(context),
  };
};

export const displayCriticalError = (
  error: Error,
  componentStack?: string,
  actions?: Array<{ label: string; onClick: () => void }>,
): ErrorDisplayResult => {
  const options: ErrorDisplayOptions = {
    severity: "critical",
    context: "global",
  };

  if (componentStack !== undefined) {
    options.componentStack = componentStack;
  }

  if (actions !== undefined) {
    options.actions = actions;
  }

  return displayError(error, options);
};

export const displayAsyncError = (
  error: Error,
  description?: string,
): ErrorDisplayResult => {
  const options: ErrorDisplayOptions = {
    severity: "error",
    context: "async",
  };

  if (description !== undefined) {
    options.description = description;
  }

  return displayError(error, options);
};

export const displayComponentError = (
  error: Error,
  componentStack?: string,
): ErrorDisplayResult => {
  const options: ErrorDisplayOptions = {
    severity: "error",
    context: "component",
  };

  if (componentStack !== undefined) {
    options.componentStack = componentStack;
  }

  return displayError(error, options);
};
