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
