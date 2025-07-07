"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { displayAsyncError } from "@/core/services/error-display";

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

  // Listen for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);

      // Convert to Error if it's not already
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      setError(error);

      // Use centralized error display service
      displayAsyncError(
        error,
        "A network request failed. Please check your connection and try again."
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
  }, []);

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
