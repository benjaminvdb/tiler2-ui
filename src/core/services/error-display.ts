import { toast } from "sonner";
import { reportErrorBoundary } from "./error-reporting";

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

const getDefaultDescription = (
  severity: ErrorSeverity,
  context: ErrorContext,
  error: Error,
): string => {
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

const shouldShowToast = (severity: ErrorSeverity, context: ErrorContext): boolean => {
  // Always show toast for critical and async errors
  if (severity === "critical" || context === "async") return true;
  
  // Show toast for global errors
  if (context === "global") return true;
  
  // Don't show toast for component errors (they have fallback UI)
  if (context === "component") return false;
  
  // Show toast for feature-level errors
  return true;
};

const shouldShowFallback = (context: ErrorContext): boolean => {
  // Always show fallback for global and component errors
  return context === "global" || context === "component";
};

const getFallbackType = (context: ErrorContext): "global" | "component" | "none" => {
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
    description = getDefaultDescription(severity, context, error),
    componentStack,
  } = options;

  // Report error for monitoring (only for significant errors)
  if (severity === "critical" || severity === "error") {
    reportErrorBoundary(error, {
      componentStack: componentStack || "Not available",
      severity,
      context,
    });
  }

  // Show toast notification if requested
  if (showToast) {
    const toastOptions = {
      description,
      duration,
      richColors: true,
      closeButton: true,
      action: actions.length > 0 ? {
        label: actions[0].label,
        onClick: actions[0].onClick,
      } : undefined,
    };

    switch (severity) {
      case "critical":
        toast.error(TOAST_TITLES[severity], toastOptions);
        break;
      case "error":
        toast.error(TOAST_TITLES[severity], toastOptions);
        break;
      case "warning":
        toast.warning(TOAST_TITLES[severity], toastOptions);
        break;
      case "info":
        toast.info(TOAST_TITLES[severity], toastOptions);
        break;
    }
  }

  // Log error for debugging
  if (process.env.NODE_ENV === "development") {
    console.error(`[${severity.toUpperCase()}][${context}]:`, error);
    if (componentStack) {
      console.error("Component stack:", componentStack);
    }
  }

  return {
    shouldShowFallback: showFallback,
    fallbackType: getFallbackType(context),
  };
};

// Convenience functions for common error types
export const displayCriticalError = (
  error: Error,
  componentStack?: string,
  actions?: Array<{ label: string; onClick: () => void }>,
): ErrorDisplayResult => {
  return displayError(error, {
    severity: "critical",
    context: "global",
    componentStack,
    actions,
  });
};

export const displayAsyncError = (
  error: Error,
  description?: string,
): ErrorDisplayResult => {
  return displayError(error, {
    severity: "error",
    context: "async",
    description,
  });
};

export const displayComponentError = (
  error: Error,
  componentStack?: string,
): ErrorDisplayResult => {
  return displayError(error, {
    severity: "error",
    context: "component",
    componentStack,
  });
};

export const displayFeatureError = (
  error: Error,
  description?: string,
  actions?: Array<{ label: string; onClick: () => void }>,
): ErrorDisplayResult => {
  return displayError(error, {
    severity: "error",
    context: "feature",
    description,
    actions,
  });
};