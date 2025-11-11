/**
 * Error Boundary Components Index
 *
 * This barrel file is acceptable because:
 * - Small, cohesive module with related exports (≤10 exports)
 * - Error boundary components are frequently used together
 * - Provides a clean API for error handling utilities
 */

export {
  GlobalErrorBoundary,
  DefaultErrorFallback,
} from "./global-error-boundary";
export { AsyncErrorBoundary, useAsyncError } from "./async-error-boundary";
export {
  ComponentErrorBoundary,
  ErrorBoundary,
  withErrorBoundary,
  ComponentErrorFallback,
} from "./component-error-boundary";
export {
  StreamErrorBoundary,
  StreamErrorFallback,
  type StreamErrorBoundaryProps,
  type StreamErrorFallbackProps,
} from "./stream-error-boundary";
export {
  displayError,
  displayCriticalError,
  displayAsyncError,
  displayComponentError,
  displayFeatureError,
  type ErrorSeverity,
  type ErrorContext,
  type ErrorDisplayOptions,
  type ErrorDisplayResult,
} from "@/core/services/error-display";
