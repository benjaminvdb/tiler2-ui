"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });

    // Log error to console in development
    console.error("Error caught by boundary:", error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            retry={this.handleRetry}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          retry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
}) => {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-destructive mb-4 text-2xl font-bold">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-6">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>
        <details className="mb-6 rounded border p-4 text-left">
          <summary className="cursor-pointer font-medium">
            Error Details
          </summary>
          <pre className="text-muted-foreground mt-2 overflow-auto text-sm">
            {error.message}
          </pre>
        </details>
        <div className="flex justify-center gap-2">
          <Button
            onClick={retry}
            variant="default"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
};

// Lightweight error boundary for specific components
const ComponentErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  retry,
}) => {
  return (
    <div className="border-destructive/20 bg-destructive/10 flex flex-col items-center justify-center rounded-lg border p-4 text-center">
      <p className="text-destructive mb-2 text-sm font-medium">
        Component Error
      </p>
      <p className="text-muted-foreground mb-3 text-xs">{error.message}</p>
      <Button
        onClick={retry}
        size="sm"
        variant="outline"
      >
        Retry
      </Button>
    </div>
  );
};

// Main error boundary for the entire app
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

// Specialized error boundary for individual components
export const ComponentErrorBoundary: React.FC<
  Omit<ErrorBoundaryProps, "fallback">
> = (props) => {
  return (
    <ErrorBoundaryClass
      {...props}
      fallback={ComponentErrorFallback}
    />
  );
};

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
