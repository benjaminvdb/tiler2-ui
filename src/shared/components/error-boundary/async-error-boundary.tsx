"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { displayAsyncError } from "@/core/services/error-display";
import { useLogger } from "@/core/services/logging";
import * as Sentry from "@sentry/react";

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}
/**
 * Error boundary for async operations that don't trigger normal React error boundaries
 */
export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  fallback: Fallback,
}) => {
  const [error, setError] = useState<Error | null>(null);
  const logger = useLogger();

  // Listen for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Convert to Error if it's not already
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      logger.error(error, {
        operation: "unhandled_rejection",
        component: "AsyncErrorBoundary",
        reason: String(event.reason),
      });

      setError(error);

      // Send error to Sentry with context
      Sentry.captureException(error, {
        contexts: {
          async: {
            type: "unhandled_rejection",
            reason: String(event.reason),
          },
        },
        tags: {
          errorBoundary: "AsyncErrorBoundary",
          category: "async",
          severity: "high",
        },
        level: "error",
      });

      // Use centralized error display service
      displayAsyncError(
        error,
        "A network request failed. Please check your connection and try again.",
      );

      // Prevent the default browser error handling
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, [logger]);

  const retry = () => {
    setError(null);
  };

  if (error && Fallback) {
    return (
      <Fallback
        error={error}
        retry={retry}
      />
    );
  }
  return <>{children}</>;
};
// Hook for manually triggering async error boundaries
export const useAsyncError = () => {
  const [, setError] = useState();

  return (error: Error) => {
    setError(() => {
      throw error;
    });
  };
};
