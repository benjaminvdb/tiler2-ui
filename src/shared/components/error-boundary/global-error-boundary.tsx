"use client";

import React, { Component, ReactNode } from "react";
import { toast } from "sonner";
import { reportErrorBoundary } from "@/core/services/error-reporting";

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}
class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Report error through comprehensive error reporting system
    reportErrorBoundary(error, {
      componentStack: errorInfo.componentStack || "Not available",
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Show user-friendly error toast
    toast.error("Something went wrong", {
      description:
        "An unexpected error occurred. Please try refreshing the page.",
      duration: 5000,
      action: {
        label: "Retry",
        onClick: () => this.handleRetry(),
      },
    });

    // In production, you might want to send to an error tracking service
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          retry={this.handleRetry}
        />
      );
    }
    return this.props.children;
  }
}
// Default error fallback component
const DefaultErrorFallback: React.FC<{
  error: Error;
  retry: () => void;
}> = ({ error, retry }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Oops! Something went wrong
          </h1>
          <p className="mb-6 text-gray-600">
            We encountered an unexpected error. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 rounded bg-gray-100 p-3 text-xs whitespace-pre-wrap text-gray-800">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          <div className="space-x-4">
            <button
              onClick={retry}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { GlobalErrorBoundary, DefaultErrorFallback };
