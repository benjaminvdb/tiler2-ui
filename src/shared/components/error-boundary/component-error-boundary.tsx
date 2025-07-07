"use client";

import React from "react";
import { Button } from "@/shared/components/ui/button";

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
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }
  retry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.retry}
          />
        );
      }
      return (
        <DefaultErrorFallback
          error={this.state.error}
          retry={this.retry}
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
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="mb-4 text-red-600">
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-red-800">
        Something went wrong
      </h2>
      <p className="mb-4 max-w-md text-center text-red-600">
        {error.message || "An unexpected error occurred"}
      </p>
      <Button
        onClick={retry}
        variant="outline"
        className="border-red-300 text-red-700 hover:bg-red-50"
      >
        Try again
      </Button>
    </div>
  );
};

// Lightweight error boundary for specific components
const ComponentErrorFallback: React.FC<ErrorFallbackProps> = ({ retry }) => {
  return (
    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-center">
        <div className="mr-3 text-yellow-600">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-yellow-800">Component failed to load</p>
          <Button
            onClick={retry}
            variant="link"
            className="h-auto p-0 text-sm text-yellow-700"
          >
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main error boundary for the entire app
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return (
    <ErrorBoundaryClass
      {...props}
      fallback={props.fallback || DefaultErrorFallback}
    />
  );
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
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export { DefaultErrorFallback, ComponentErrorFallback };
