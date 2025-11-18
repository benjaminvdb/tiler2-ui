# Error Handling

This document covers the comprehensive error handling strategy, including error boundaries, HTTP error handling, retry strategies, Sentry integration, user-facing error messages, and recovery patterns.

## Error Boundaries

Error boundaries catch JavaScript errors anywhere in the component tree, log errors, and display fallback UIs.

### Global Error Boundary

The root-level error boundary catches all uncaught errors in the application.

**Location**: `/home/user/tiler2-ui/src/shared/components/error-boundary/global-error-boundary.tsx`

```typescript
import React, { Component, ReactNode } from "react";
import { displayCriticalError } from "@/core/services/error-display";
import * as Sentry from "@sentry/react";

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

    // Special handling for AccessTokenError
    if (error.name === "AccessTokenError") {
      window.location.href = "/api/auth/login";
      return;
    }

    // Report to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: "GlobalErrorBoundary",
        category: "ui",
        severity: "critical",
      },
      level: "error",
    });

    // Show critical error dialog
    displayCriticalError(error, errorInfo.componentStack || undefined, [
      { label: "Retry", onClick: () => this.handleRetry() },
    ]);

    this.props.onError?.(error, errorInfo);
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
```

**Key Features**:
- Catches all uncaught errors in React component tree
- Special handling for `AccessTokenError` (immediate redirect to login)
- Reports errors to Sentry with React context
- Displays critical error dialog with retry option
- Shows development-only error details in dev mode

**WHY**: Global error boundaries prevent the entire app from crashing when an error occurs, providing a graceful fallback UI and recovery options.

### Stream Error Boundary

Specialized error boundary for handling streaming-related errors.

**Location**: `/home/user/tiler2-ui/src/shared/components/error-boundary/stream-error-boundary.tsx`

```typescript
class StreamErrorBoundaryClass extends React.Component<
  StreamErrorBoundaryProps,
  StreamErrorBoundaryState
> {
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

    // Handle authentication errors
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
}
```

**Error Categorization**:

```typescript
function categorizeStreamError(error: Error): {
  type: "auth" | "network" | "timeout" | "rateLimit" | "server" | "unknown";
  statusCode?: number;
} {
  const message = error.message.toLowerCase();

  // Extract HTTP status code from error message
  const httpMatch = message.match(/http[s]?\s+(\d{3})/i);
  const statusCode = httpMatch ? parseInt(httpMatch[1], 10) : undefined;

  // Authentication errors (401, 403)
  if (
    statusCode === 401 ||
    statusCode === 403 ||
    message.includes("unauthorized") ||
    message.includes("forbidden")
  ) {
    return { type: "auth", statusCode };
  }

  // Rate limit errors (429)
  if (statusCode === 429 || message.includes("rate limit")) {
    return { type: "rateLimit", statusCode };
  }

  // Server errors (5xx)
  if (statusCode && statusCode >= 500 && statusCode < 600) {
    return { type: "server", statusCode };
  }

  // Timeout errors
  if (
    message.includes("timeout") ||
    message.includes("timed out")
  ) {
    return { type: "timeout", statusCode };
  }

  // Network errors
  if (
    message.includes("failed to fetch") ||
    message.includes("network")
  ) {
    return { type: "network", statusCode };
  }

  return { type: "unknown", statusCode };
}
```

**Custom Fallback UI**:

```typescript
const StreamErrorFallback: React.FC<StreamErrorFallbackProps> = ({
  error,
  retry,
  startNewChat,
  isOnline,
}) => {
  const { type, statusCode } = categorizeStreamError(error);

  const getErrorMessage = () => {
    if (!isOnline) {
      return {
        title: "You're offline",
        description: "Check your internet connection and try again when you're back online.",
        icon: <WifiOff className="h-12 w-12" />,
      };
    }

    switch (type) {
      case "auth":
        return {
          title: "Authentication Error",
          description: "Your session may have expired. You'll be redirected to log in again.",
          icon: <AlertTriangle className="h-12 w-12" />,
        };
      case "rateLimit":
        return {
          title: "Rate Limit Exceeded",
          description: "You've sent too many requests. Please wait a moment before trying again.",
          icon: <AlertTriangle className="h-12 w-12" />,
        };
      case "timeout":
        return {
          title: "Connection Timeout",
          description: "The request took too long to complete. Please try again.",
          icon: <RefreshCw className="h-12 w-12" />,
        };
      case "server":
        return {
          title: "Server Error",
          description: "The AI service is temporarily unavailable. We're working to fix it.",
          icon: <AlertTriangle className="h-12 w-12" />,
        };
      default:
        return {
          title: "Stream Connection Interrupted",
          description: error.message || "An unexpected error occurred with the AI stream.",
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
        <Button onClick={retry} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Connection
        </Button>
        <Button onClick={startNewChat} variant="outline">
          Start New Chat
        </Button>
      </div>
    </div>
  );
};
```

**WHY**: Stream errors require specialized handling because they involve real-time connections, network issues, and authentication that may fail mid-stream.

### Feature-Level Error Boundaries

Wrap individual features to isolate errors:

```typescript
import { ComponentErrorBoundary } from "@/shared/components/error-boundary/component-error-boundary";

function ChatPage() {
  return (
    <ComponentErrorBoundary
      fallback={(error, retry) => (
        <div>
          <p>Chat failed to load: {error.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
    >
      <ChatComponent />
    </ComponentErrorBoundary>
  );
}
```

**WHY**: Feature-level boundaries prevent errors in one feature from crashing the entire application.

## HTTP Error Handling

### Error Detection

The HTTP client automatically detects and categorizes errors:

```typescript
// /home/user/tiler2-ui/src/core/services/http-client.ts

// Custom error class for 403 errors
export class ForbiddenError extends Error {
  constructor(
    message = "You don't have permission to access this resource",
    public readonly originalResponse?: Response,
  ) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function isForbiddenError(error: unknown): error is ForbiddenError {
  return error instanceof Error && error.name === "ForbiddenError";
}

// Automatic 403 retry with token refresh
if (response.status === 403 && !skip403Retry) {
  try {
    const newToken = await getToken();
    requestHeaders.Authorization = `Bearer ${newToken}`;
    const retryResponse = await executeRequest();

    if (retryResponse.status === 403) {
      triggerSilentLogout("403 Forbidden persisted after token refresh");
      throw new ForbiddenError("Access denied after token refresh", retryResponse);
    }

    return retryResponse;
  } catch (error) {
    triggerSilentLogout("Token refresh failed on 403 error");
    throw new ForbiddenError("Failed to refresh token after 403 error", response);
  }
}
```

### HTTP Status Code Handling

| Status Code | Handling Strategy |
|-------------|------------------|
| 401 | Redirect to login |
| 403 | Retry with token refresh, then logout |
| 408 | Retry with exponential backoff |
| 429 | Retry with longer backoff, show rate limit message |
| 500-504 | Retry with exponential backoff |
| 5xx | Report to Sentry, show error message |

## Retry Strategies

### p-retry Integration

The application uses the `p-retry` library for robust retry logic with exponential backoff and jitter.

**Location**: `/home/user/tiler2-ui/src/shared/utils/retry.ts`

```typescript
import pRetry, { AbortError as PRetryAbortError } from "p-retry";

export const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

export async function fetchWithRetry(
  url: string,
  options: RequestInit & { timeoutMs?: number } = {},
  config: RetryConfig = {},
): Promise<Response> {
  const {
    maxRetries = 4,
    baseDelay = 1000,
    maxDelay = 16000,
    maxRetryTime,
    signal,
    onRetry,
  } = config;

  return await pRetry(
    async () => {
      const response = await fetch(url, options);

      if (isRetryableResponse(response)) {
        const error = new Error(
          `HTTP ${response.status}: ${response.statusText}`
        ) as RetryableError;
        error.isRetryable = true;
        error.statusCode = response.status;
        throw error;
      }

      // Don't retry 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        throw new PRetryAbortError(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response;
    },
    {
      retries: maxRetries,
      factor: 2,              // Exponential factor (2^n)
      minTimeout: baseDelay,
      maxTimeout: maxDelay,
      randomize: true,        // Add jitter
      onFailedAttempt: (error) => {
        if (error.retriesLeft === 0) {
          reportNetworkError(error, {
            operation: "fetchWithRetry",
            component: "retry utilities",
            url,
            additionalData: {
              attempts: error.attemptNumber,
              exhaustedRetries: true,
            },
          });
        } else {
          Sentry.addBreadcrumb({
            category: "retry",
            message: `Retry attempt ${error.attemptNumber} for ${url}`,
            level: "info",
            data: {
              retriesLeft: error.retriesLeft,
              error: error.message,
            },
          });
        }
      },
    },
  );
}
```

**Retry Schedule** (with jitter):
1. First retry: ~1s
2. Second retry: ~2s
3. Third retry: ~4s
4. Fourth retry: ~8s
5. Max: 16s cap

**WHY Jitter**: Randomization prevents thundering herd problems where many clients retry simultaneously and overwhelm a recovering service.

### Retryable vs Non-Retryable Errors

**Retryable Errors**:
- Network failures (`fetch failed`, `network error`)
- Timeouts (408)
- Server errors (500, 502, 503, 504)
- Rate limits (429) with longer backoff

**Non-Retryable Errors**:
- Client errors (400, 404, 422)
- Authentication errors (401, 403) - handled separately
- AbortError (user cancellation)
- Invalid request format

```typescript
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  if (error.name === "AbortError") return false;
  if (error instanceof PRetryAbortError) return false;

  const message = error.message.toLowerCase();
  if (
    message.includes("fetch failed") ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed")
  ) {
    return true;
  }

  if ("isRetryable" in error && typeof error.isRetryable === "boolean") {
    return error.isRetryable;
  }

  return false;
}
```

## Network Error Detection

The application monitors network connectivity to provide better error messages:

```typescript
// Network status provider tracks online/offline state
const { isOnline } = useNetworkStatus();

if (!isOnline) {
  return {
    title: "You're offline",
    description: "Check your internet connection and try again when you're back online.",
    icon: <WifiOff />,
  };
}
```

**Network Events**:
- `online` - Network connection restored
- `offline` - Network connection lost

## User-Facing Error Messages

### Toast Notifications (Sonner)

The application uses `sonner` for user-friendly error notifications.

**Location**: Toast notifications are triggered via the observability system

```typescript
// /home/user/tiler2-ui/src/core/services/observability/client.ts
import { toast } from "sonner";

const showUserNotification = (
  severity: Severity,
  message: string,
  category?: ErrorCategory,
): void => {
  import("sonner").then(({ toast }) => {
    switch (severity) {
      case "fatal":
        toast.error("Critical Error", {
          description: `${message}${category ? ` (${category})` : ""}`,
          duration: 0,  // Stays until dismissed
        });
        break;
      case "error":
        toast.error("Error", {
          description: message,
          duration: 8000,
        });
        break;
      case "warn":
        toast.warning("Warning", {
          description: message,
          duration: 5000,
        });
        break;
      case "info":
        toast.info("Notice", {
          description: message,
          duration: 3000,
        });
        break;
    }
  });
};
```

**Toast Examples**:

```typescript
// Success
toast.success("Message sent successfully");

// Error with action
toast.error("Failed to send message", {
  action: {
    label: "Retry",
    onClick: () => handleRetry(),
  },
});

// Custom duration
toast.warning("Rate limit exceeded", {
  duration: 10000,
});

// Rich content
toast.error("Connection failed", {
  description: () => (
    <div>
      <p>Could not connect to server at {apiUrl}</p>
      <code className="text-xs">{error.message}</code>
    </div>
  ),
});
```

### Error Message Guidelines

**DO**:
- Use plain language, not technical jargon
- Explain what went wrong and why
- Provide actionable next steps
- Include retry or recovery options
- Use appropriate severity levels

**DON'T**:
- Don't show stack traces to users
- Don't expose sensitive information
- Don't use generic messages like "Error occurred"
- Don't blame the user
- Don't show errors without context

**Examples**:

Good:
```
"Unable to send message. Please check your internet connection and try again."
```

Bad:
```
"Error: ECONNREFUSED"
```

## Sentry Integration

### Sentry Setup

Sentry is configured for error tracking and performance monitoring.

**Environment Variable**: `VITE_SENTRY_DSN`

### Error Reporting

```typescript
// /home/user/tiler2-ui/src/core/services/observability/client.ts
import * as Sentry from "@sentry/react";

// Report error to Sentry
Sentry.captureException(error, {
  level: "error",
  tags: {
    category: "api",
    operation: "fetchThreads",
    component: "ThreadList",
  },
  contexts: {
    thread: {
      id: threadId,
    },
  },
  extra: {
    url: apiUrl,
    statusCode: response.status,
  },
});
```

### Breadcrumbs

Sentry breadcrumbs provide context leading up to errors:

```typescript
// Add breadcrumb for user actions
Sentry.addBreadcrumb({
  category: "user-action",
  message: "User clicked send button",
  level: "info",
  data: {
    threadId,
    messageLength: content.length,
  },
});

// Add breadcrumb for API calls
Sentry.addBreadcrumb({
  category: "api",
  message: `Fetching threads from ${url}`,
  level: "info",
  data: {
    url,
    method: "GET",
  },
});

// Add breadcrumb for retries
Sentry.addBreadcrumb({
  category: "retry",
  message: `Retry attempt ${attemptNumber} for ${url}`,
  level: "info",
  data: {
    retriesLeft: error.retriesLeft,
    error: error.message,
  },
});
```

**WHY**: Breadcrumbs help diagnose issues by showing the sequence of events that led to an error.

### Context and Tags

```typescript
// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
});

// Set custom context
Sentry.setContext("assistant", {
  id: assistantId,
  apiUrl: apiUrl,
});

// Set tags for filtering
Sentry.setTag("assistant_id", assistantId);
Sentry.setTag("environment", import.meta.env.MODE);
```

### Performance Tracking

```typescript
export const trackPerformance = (
  operation: string,
  duration: number,
  context?: ObservabilityContext,
): void => {
  Sentry.addBreadcrumb({
    category: "performance",
    message: `${operation} completed`,
    level: duration > 5000 ? "warning" : "info",
    data: {
      operation,
      duration,
      ...context,
    },
  });

  if (duration > 5000) {
    reportError(
      `Slow operation detected: ${operation} took ${duration}ms`,
      "info",
      "unknown",
      {
        operation,
        ...context,
        additionalData: { duration, threshold: 5000 },
      },
    );
  }
};
```

## Error Recovery Patterns

### Retry with State Reset

```typescript
const [error, setError] = useState<Error | null>(null);

const retry = async () => {
  setError(null);
  try {
    await operation();
  } catch (err) {
    setError(err as Error);
  }
};
```

### Optimistic Updates with Rollback

```typescript
const [threads, setThreads] = useState<Thread[]>([]);

const deleteThread = async (threadId: string) => {
  // Optimistic update
  const previousThreads = threads;
  setThreads(threads.filter(t => t.id !== threadId));

  try {
    await api.deleteThread(threadId);
  } catch (error) {
    // Rollback on error
    setThreads(previousThreads);
    toast.error("Failed to delete thread");
  }
};
```

### Fallback Data

```typescript
const loadData = async () => {
  try {
    return await api.fetchData();
  } catch (error) {
    console.error("Failed to fetch data, using fallback", error);
    return DEFAULT_DATA;
  }
};
```

### Circuit Breaker Pattern

```typescript
let failureCount = 0;
const MAX_FAILURES = 3;
let isCircuitOpen = false;

const callApi = async () => {
  if (isCircuitOpen) {
    throw new Error("Circuit breaker is open");
  }

  try {
    const result = await api.call();
    failureCount = 0;  // Reset on success
    return result;
  } catch (error) {
    failureCount++;
    if (failureCount >= MAX_FAILURES) {
      isCircuitOpen = true;
      setTimeout(() => {
        isCircuitOpen = false;
        failureCount = 0;
      }, 60000);  // Retry after 1 minute
    }
    throw error;
  }
};
```

## Graceful Degradation

### Feature Flags

```typescript
const isFeatureEnabled = (feature: string): boolean => {
  try {
    return features[feature] === true;
  } catch {
    return false;  // Degrade gracefully
  }
};

function MyComponent() {
  if (!isFeatureEnabled("advanced-search")) {
    return <BasicSearch />;
  }
  return <AdvancedSearch />;
}
```

### Progressive Enhancement

```typescript
function ChatComponent() {
  const { isOnline } = useNetworkStatus();

  if (!isOnline) {
    return (
      <div>
        <p>You're currently offline.</p>
        <p>Messages will be sent when you reconnect.</p>
      </div>
    );
  }

  return <RealTimeChat />;
}
```

## Code Examples

### Complete Error Handling Flow

```typescript
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { toast } from "sonner";
import { useState } from "react";

function DataLoader() {
  const fetch = useAuthenticatedFetch();
  const [data, setData] = useState(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/data", {
        timeoutMs: 10000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      toast.success("Data loaded successfully");
    } catch (err) {
      const error = err as Error;
      setError(error);

      if (isForbiddenError(error)) {
        // User already logged out by http-client
        return;
      }

      toast.error("Failed to load data", {
        description: error.message,
        action: {
          label: "Retry",
          onClick: () => loadData(),
        },
      });

      reportApiError(error, {
        operation: "loadData",
        component: "DataLoader",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <ErrorDisplay error={error} retry={loadData} />}
      {isLoading && <LoadingSpinner />}
      {data && <DataDisplay data={data} />}
    </div>
  );
}
```

## Best Practices

### DO
- Always wrap async operations in try-catch
- Provide clear error messages to users
- Log errors to observability system
- Implement retry logic for transient failures
- Use error boundaries to catch React errors
- Show recovery options (retry, refresh, etc.)
- Monitor error rates and patterns

### DON'T
- Don't catch and ignore errors silently
- Don't show technical error details to users
- Don't retry indefinitely without backoff
- Don't expose sensitive data in error messages
- Don't let errors crash the entire application
- Don't skip error logging for "expected" errors

## Next Steps

- [API Integration](./15-api-integration.md) - HTTP client and retry logic
- [Styling & Theming](./18-styling-theming.md) - UI patterns for error states
