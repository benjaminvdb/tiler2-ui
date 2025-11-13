/**
 * Unified observability system
 * Provides structured logging and comprehensive error reporting
 *
 * Usage patterns:
 *
 * 1. Direct logging (utility functions, services):
 *    ```typescript
 *    import { observability } from "@/core/services/observability";
 *    observability.debug("Processing file", { fileName: file.name });
 *    observability.error(error, { operation: "processFile" });
 *    ```
 *
 * 2. Child loggers (scoped context):
 *    ```typescript
 *    import { observability } from "@/core/services/observability";
 *    const logger = observability.child({ component: "FileProcessor" });
 *    logger.info("Started processing");
 *    ```
 *
 * 3. React components (auto-context injection):
 *    ```typescript
 *    import { useObservability } from "@/core/services/observability";
 *    const logger = useObservability({ component: "FileUpload" });
 *    logger.info("File uploaded");
 *    ```
 *
 * 4. Error reporting (with user notifications):
 *    ```typescript
 *    import { reportThreadError } from "@/core/services/observability";
 *    reportThreadError(error, { operation: "fetchThreads" });
 *    ```
 */

export { observability, getObservability, createObservability } from "./client";

export { useObservability } from "./hook";

export {
  reportError,
  reportAuthError,
  reportApiError,
  reportValidationError,
  reportUiError,
  reportStreamError,
  reportThreadError,
  reportFileUploadError,
  reportStorageError,
  reportNetworkError,
  reportCriticalError,
  reportErrorBoundary,
  reportRetryExhausted,
} from "./client";

export {
  trackPerformance,
  withErrorHandling,
  getErrorStats,
  clearErrorHistory,
  validateObservabilityConfig,
} from "./client";

export type {
  ILogger,
  Severity,
  ErrorCategory,
  ObservabilityContext,
  ObservabilityConfig,
  StructuredError,
} from "./types";

export { redactSensitiveData, containsSensitiveData } from "./filters";
