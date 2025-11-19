import React from "react";
import { Button } from "@/shared/components/ui/button";
import { WifiOff, RefreshCw, AlertTriangle } from "lucide-react";
import { reportStreamError } from "@/core/services/observability";
import { useNetworkStatus } from "@/core/providers/network-status-provider";

interface StreamErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export interface StreamErrorBoundaryProps {
  children: React.ReactNode;
  assistantId?: string;
  threadId?: string | null;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  fallback?: React.ComponentType<StreamErrorFallbackProps>;
}

export interface StreamErrorFallbackProps {
  error: Error;
  retry: () => void;
  startNewChat: () => void;
  isOnline: boolean;
  assistantId?: string;
  threadId?: string | null;
}

/**
 * Helper functions to categorize errors by type
 */
const isAuthError = (message: string, statusCode?: number): boolean => {
  return (
    statusCode === 401 ||
    statusCode === 403 ||
    message.includes("unauthorized") ||
    message.includes("forbidden") ||
    message.includes("authentication") ||
    message.includes("no authentication token")
  );
};

const isRateLimitError = (message: string, statusCode?: number): boolean => {
  return statusCode === 429 || message.includes("rate limit");
};

const isServerError = (statusCode?: number): boolean => {
  return !!statusCode && statusCode >= 500 && statusCode < 600;
};

const isTimeoutError = (message: string): boolean => {
  return (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("request timeout")
  );
};

const isNetworkError = (message: string): boolean => {
  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("networkerror")
  );
};

/**
 * Categorize stream errors for appropriate handling
 */
function categorizeStreamError(error: Error): {
  type: "auth" | "network" | "timeout" | "rateLimit" | "server" | "unknown";
  statusCode?: number;
} {
  const message = error.message.toLowerCase();
  const httpMatch = message.match(/http[s]?\s+(\d{3})/i);
  const statusCode = httpMatch ? parseInt(httpMatch[1], 10) : undefined;

  const makeResult = (
    type: "auth" | "network" | "timeout" | "rateLimit" | "server" | "unknown",
  ) => (statusCode !== undefined ? { type, statusCode } : { type });

  if (isAuthError(message, statusCode)) return makeResult("auth");
  if (isRateLimitError(message, statusCode)) return makeResult("rateLimit");
  if (isServerError(statusCode))
    return { type: "server", statusCode: statusCode! };
  if (isTimeoutError(message)) return makeResult("timeout");
  if (isNetworkError(message)) return makeResult("network");

  return makeResult("unknown");
}

class StreamErrorBoundaryClass extends React.Component<
  StreamErrorBoundaryProps,
  StreamErrorBoundaryState
> {
  constructor(props: StreamErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): StreamErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    const { type, statusCode } = categorizeStreamError(error);

    reportStreamError(error, {
      operation: "stream_error_boundary",
      component: "StreamErrorBoundary",
      additionalData: {
        errorType: type,
        statusCode,
        componentStack: errorInfo.componentStack,
        assistantId: this.props.assistantId,
        threadId: this.props.threadId,
      },
    });

    if (type === "auth") {
      if (statusCode === 401) {
        window.location.href = "/api/auth/login";
      } else if (statusCode === 403) {
        window.location.href = "/api/auth/logout";
      }
    }

    this.props.onError?.(error, errorInfo);
  }

  retry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  startNewChat = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.retry}
            startNewChat={this.startNewChat}
            isOnline={true}
            {...(this.props.assistantId !== undefined && {
              assistantId: this.props.assistantId,
            })}
            {...(this.props.threadId !== undefined && {
              threadId: this.props.threadId,
            })}
          />
        );
      }
      return (
        <StreamErrorFallbackWrapper
          error={this.state.error}
          retry={this.retry}
          startNewChat={this.startNewChat}
          {...(this.props.assistantId !== undefined && {
            assistantId: this.props.assistantId,
          })}
          {...(this.props.threadId !== undefined && {
            threadId: this.props.threadId,
          })}
        />
      );
    }
    return this.props.children;
  }
}

/**
 * Wrapper component that provides network status to fallback UI
 */
const StreamErrorFallbackWrapper: React.FC<
  Omit<StreamErrorFallbackProps, "isOnline">
> = (props) => {
  const { isOnline } = useNetworkStatus();
  return (
    <StreamErrorFallback
      {...props}
      isOnline={isOnline}
    />
  );
};

/**
 * Default fallback UI for stream errors with recovery actions
 */
const StreamErrorFallback: React.FC<StreamErrorFallbackProps> = ({
  error,
  retry,
  startNewChat,
  isOnline,
}) => {
  const { type, statusCode } = categorizeStreamError(error);

  const getErrorMessage = (): {
    title: string;
    description: string;
    icon: React.ReactNode;
  } => {
    if (!isOnline) {
      return {
        title: "You're offline",
        description:
          "Check your internet connection and try again when you're back online.",
        icon: <WifiOff className="h-12 w-12" />,
      };
    }

    switch (type) {
      case "auth":
        return {
          title: "Authentication Error",
          description:
            "Your session may have expired. You'll be redirected to log in again.",
          icon: <AlertTriangle className="h-12 w-12" />,
        };
      case "rateLimit":
        return {
          title: "Rate Limit Exceeded",
          description:
            "You've sent too many requests. Please wait a moment before trying again.",
          icon: <AlertTriangle className="h-12 w-12" />,
        };
      case "timeout":
        return {
          title: "Connection Timeout",
          description:
            "The request took too long to complete. Please try again.",
          icon: <RefreshCw className="h-12 w-12" />,
        };
      case "server":
        return {
          title: "Server Error",
          description:
            "The AI service is temporarily unavailable. We're working to fix it.",
          icon: <AlertTriangle className="h-12 w-12" />,
        };
      case "network":
        return {
          title: "Connection Failed",
          description:
            "Unable to connect to the AI service. Please check your connection and try again.",
          icon: <WifiOff className="h-12 w-12" />,
        };
      default:
        return {
          title: "Stream Connection Interrupted",
          description:
            error.message || "An unexpected error occurred with the AI stream.",
          icon: <AlertTriangle className="h-12 w-12" />,
        };
    }
  };

  const { title, description, icon } = getErrorMessage();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50 p-8">
      <div className="mb-4 text-amber-600">{icon}</div>

      <h2 className="mb-2 text-xl font-semibold text-amber-900">{title}</h2>

      <p className="mb-6 max-w-md text-center text-amber-700">{description}</p>

      {statusCode && (
        <p className="mb-4 text-sm text-amber-600">Error code: {statusCode}</p>
      )}

      <div className="flex gap-3">
        <Button
          onClick={retry}
          variant="default"
          className="bg-forest-green hover:bg-forest-green/90"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Connection
        </Button>

        <Button
          onClick={startNewChat}
          variant="outline"
          className="border-amber-300 text-amber-700 hover:bg-amber-100"
        >
          Start New Chat
        </Button>
      </div>

      {!isOnline && (
        <p className="mt-4 text-sm text-amber-600">
          Waiting for internet connection...
        </p>
      )}
    </div>
  );
};

/**
 * Main stream error boundary component
 */
export const StreamErrorBoundary: React.FC<StreamErrorBoundaryProps> = (
  props,
) => {
  return <StreamErrorBoundaryClass {...props} />;
};

export { StreamErrorFallback, StreamErrorFallbackWrapper };
