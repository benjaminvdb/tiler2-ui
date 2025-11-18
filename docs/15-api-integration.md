# API Integration

This document covers the integration with the LangGraph API backend, including HTTP client implementation, streaming with Server-Sent Events, authentication headers, retry logic, and error handling.

## LangGraph API Overview

The application communicates with a LangGraph API server that provides:

- **Thread Management**: Create, retrieve, and manage conversation threads
- **Streaming Responses**: Real-time AI responses via Server-Sent Events (SSE)
- **Workflow Execution**: Execute LangGraph workflows with interrupts and tool calls
- **Health Monitoring**: API health checks and status verification

The API URL and Assistant ID are configured via environment variables:

```typescript
// /home/user/tiler2-ui/src/core/config/client.ts
export interface ClientConfig {
  apiUrl: string;
  assistantId: string;
}

export function getClientConfig(): ClientConfig {
  return {
    apiUrl: env.API_URL || "http://localhost:2024",
    assistantId: env.ASSISTANT_ID || "assistant",
  };
}
```

## HTTP Client Implementation

### Core HTTP Client

The application uses a custom HTTP client with automatic authentication and 403 error handling located at `/home/user/tiler2-ui/src/core/services/http-client.ts`.

**Key Features**:
- Automatic token injection via Auth0
- 403 retry with token refresh
- Timeout handling with AbortController
- Network retry with exponential backoff (via p-retry)
- Automatic logout on persistent auth failures
- Observability integration with Sentry

```typescript
// /home/user/tiler2-ui/src/core/services/http-client.ts
interface FetchWithAuthOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  skipAuth?: boolean;          // Skip automatic token fetching
  skip403Retry?: boolean;       // Skip automatic 403 retry
  timeoutMs?: number;           // Timeout in milliseconds (default: 10000)
}

export async function fetchWithAuth(
  getToken: TokenGetter,
  url: string,
  options: FetchWithAuthOptions = {},
): Promise<Response>
```

**Implementation Details**:

1. **Token Injection**: Automatically adds `Authorization: Bearer <token>` header
2. **403 Handling**: On 403 error, refreshes token and retries once
3. **Timeout Management**: Uses AbortSignal with configurable timeout
4. **Network Retries**: Integrates with `fetchWithRetry` for transient failures

```typescript
// Example: 403 retry logic
if (response.status === 403 && !skip403Retry) {
  logForbiddenRetry(url, "pending");

  try {
    const newToken = await getToken();
    requestHeaders.Authorization = `Bearer ${newToken}`;

    const retryResponse = await executeRequest(fetchOptions.signal ?? undefined);

    if (retryResponse.status === 403) {
      triggerSilentLogout("403 Forbidden persisted after token refresh");
      throw new ForbiddenError("Access denied after token refresh", retryResponse);
    }

    logForbiddenRetry(url, "succeeded");
    return retryResponse;
  } catch (error) {
    triggerSilentLogout("Token refresh failed on 403 error");
    throw new ForbiddenError("Failed to refresh token after 403 error", response);
  }
}
```

### React Hook: useAuthenticatedFetch

For convenience in React components, use the `useAuthenticatedFetch` hook:

```typescript
// /home/user/tiler2-ui/src/core/services/http-client.ts
export function useAuthenticatedFetch() {
  const { getAccessTokenSilently } = useAuth0();

  const getToken = useCallback(async (): Promise<string> => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: env.AUTH0_AUDIENCE,
        },
      });
      return token;
    } catch (error) {
      reportAuthError(error as Error, {
        operation: "getAccessTokenSilently",
        component: "useAuthenticatedFetch",
      });
      throw error;
    }
  }, [getAccessTokenSilently]);

  return useCallback(
    (url: string, options?: FetchWithAuthOptions) =>
      fetchWithAuth(getToken, url, options),
    [getToken],
  );
}
```

**Usage Example**:

```typescript
function MyComponent() {
  const fetch = useAuthenticatedFetch();

  const loadData = async () => {
    const response = await fetch('/api/threads/search');
    const data = await response.json();
    return data;
  };
}
```

## Retry Logic with Exponential Backoff

The application uses `p-retry` for robust network retry handling with exponential backoff and jitter.

### Retry Configuration

Located at `/home/user/tiler2-ui/src/shared/utils/retry.ts`:

```typescript
export interface RetryConfig {
  maxRetries?: number;      // Maximum number of retry attempts (default: 4)
  baseDelay?: number;       // Base delay in ms for first retry (default: 1000)
  maxDelay?: number;        // Maximum delay to cap exponential backoff (default: 16000)
  maxRetryTime?: number;    // Maximum total time for all retries
  signal?: AbortSignal;     // Optional AbortSignal to cancel retries
  onRetry?: (attempt: number, error: Error) => void;  // Callback before each retry
}

const NETWORK_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 8000,
};
```

### Retryable Errors

The system automatically retries these HTTP status codes:

```typescript
export const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

export const isRetryableResponse = (response: Response): boolean =>
  RETRYABLE_STATUS_CODES.includes(response.status);
```

**Network Errors** that trigger retries:
- `"fetch failed"`
- `"failed to fetch"`
- `"networkerror"`
- `"network request failed"`
- `"the internet connection appears to be offline"`

### fetchWithRetry Implementation

```typescript
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

      // Don't retry 4xx errors (except retryable ones)
      if (response.status >= 400 && response.status < 500) {
        throw new PRetryAbortError(
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response;
    },
    {
      retries: maxRetries,
      factor: 2,              // Exponential backoff factor
      minTimeout: baseDelay,
      maxTimeout: maxDelay,
      randomize: true,        // Add jitter to prevent thundering herd
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
        }
      },
    },
  );
}
```

**WHY**: Exponential backoff with jitter prevents overwhelming a recovering service and distributes retry attempts over time to avoid "thundering herd" problems.

## API Endpoints

### Thread Search

**Endpoint**: `GET /threads/search`

Search for threads based on metadata and status.

```typescript
const response = await fetch('/threads/search', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const threads = await response.json();
```

### Get Thread by ID

**Endpoint**: `GET /threads/{threadId}`

Retrieve a specific thread with its full history.

```typescript
const response = await fetch(`/threads/${threadId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const thread = await response.json();
```

### Stream Runs

**Endpoint**: `POST /runs/stream`

Execute a workflow and stream results via Server-Sent Events.

**Request Format**:
```typescript
{
  "assistant_id": "assistant",
  "thread_id": "thread-uuid",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ]
  },
  "stream_mode": "messages",
  "metadata": {}
}
```

**Response**: Server-Sent Events stream with various event types:
- `data: {"type": "message", "content": "..."}`
- `data: {"type": "metadata", "run_id": "..."}`
- `data: {"type": "ui", "action": "..."}`
- `data: {"type": "error", "message": "..."}`

### Workflows

**Endpoint**: `GET /workflows`

List available workflows.

```typescript
const response = await fetch('/workflows', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
const workflows = await response.json();
```

### Health Check

**Endpoint**: `GET /health`

Check API server health status.

```typescript
const response = await fetch('/health');
const { status } = await response.json();
```

## Streaming with Server-Sent Events

The application uses the LangGraph SDK to handle SSE streaming for real-time AI responses.

### Stream Configuration

From `/home/user/tiler2-ui/src/core/providers/stream/stream-session.tsx`:

```typescript
const STREAM_TIMEOUT_MS = 15000;

const streamConfig = useMemo(() => {
  if (!accessToken) return null;

  return {
    apiUrl,
    apiKey: undefined,
    assistantId,
    threadId: threadId ?? null,
    timeoutMs: STREAM_TIMEOUT_MS,
    defaultHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
}, [accessToken, apiUrl, assistantId, threadId]);
```

**WHY**: The stream config is only created when a token is available. This prevents the SDK from initializing without authentication headers, which would cause 403 errors.

### Stream Event Handling

```typescript
const streamValue = useTypedStream({
  ...streamConfig,
  fetchStateHistory: shouldFetchHistory,
  onMetadataEvent: (data: { run_id?: string }) => {
    if (data.run_id) {
      setCurrentRunId(data.run_id);
    }
  },
  onCustomEvent: (event: unknown, options) => {
    // Handle UI messages
    if (isUIMessage(event) || isRemoveUIMessage(event)) {
      mutate((prev: GraphState) => {
        const ui = uiMessageReducer(prev.ui ?? [], event);
        return { ...prev, ui };
      });
    }

    // Handle error events
    if (isStreamErrorEvent(event) && event.type === "error") {
      reportStreamError(new Error(event.message), {
        operation: "stream_event",
        component: "StreamSession",
        additionalData: {
          eventType: event.type,
          assistantId,
          threadId,
          runId: currentRunId,
        },
      });
    }
  },
  onError: (error: unknown) => {
    const err = error instanceof Error ? error : new Error(String(error));
    reportStreamError(err, {
      operation: "stream_general",
      component: "StreamSession",
      additionalData: { assistantId, threadId, currentRunId },
    });
  },
  onThreadId: (id: string) => {
    setThreadId(id);
    verifyThreadCreation(id);
  },
});
```

### Stream Error Recovery

The stream provider includes error recovery mechanisms:

```typescript
const retryStream = useCallback(async () => {
  setStreamError(null);
  setAccessToken(null);  // Force token refresh on retry
}, []);

const clearError = useCallback(() => {
  setStreamError(null);
}, []);
```

## Authentication Headers

All authenticated requests include the `Authorization` header with a Bearer token:

```typescript
const requestHeaders: Record<string, string> = { ...headers };

if (!skipAuth) {
  try {
    const token = await getToken();
    requestHeaders.Authorization = `Bearer ${token}`;
  } catch (error) {
    reportAuthError(error as Error, {
      operation: "getToken",
      component: "http-client",
    });
    throw error;
  }
}
```

**Token Refresh Strategy**:
1. Token is fetched from Auth0 SDK via `getAccessTokenSilently()`
2. If a 403 error occurs, the client automatically refreshes the token and retries
3. If the retry still fails with 403, the user is logged out

## Network Status Detection

The application monitors network connectivity to provide better error messages and retry behavior:

```typescript
// Network status is tracked via the NetworkStatusProvider
const { isOnline } = useNetworkStatus();

if (!isOnline) {
  // Show offline error message
  // Disable retry attempts
  // Queue requests for when online
}
```

## Error Handling

See [Error Handling](./17-error-handling.md) for comprehensive error handling patterns.

**API-specific error handling**:

```typescript
try {
  const response = await fetchWithAuth(getToken, url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
} catch (error) {
  if (isForbiddenError(error)) {
    // User already logged out by http-client
    return null;
  }

  reportApiError(error as Error, {
    operation: "fetchData",
    url,
  });

  throw error;
}
```

## Best Practices

### DO
- Use `useAuthenticatedFetch()` hook for API calls in components
- Set appropriate timeouts for long-running operations
- Handle 403 errors gracefully (automatic logout)
- Use retry logic for transient failures
- Report errors to observability system
- Include operation context in error reports

### DON'T
- Don't bypass authentication for protected endpoints
- Don't implement custom retry logic (use `fetchWithRetry`)
- Don't ignore AbortSignal cancellations
- Don't catch and swallow errors without logging
- Don't use `fetch` directly for authenticated requests

## Code Examples

### Making an Authenticated API Call

```typescript
import { useAuthenticatedFetch } from "@/core/services/http-client";

function MyComponent() {
  const fetch = useAuthenticatedFetch();

  const loadThreads = async () => {
    try {
      const response = await fetch("/threads/search");

      if (!response.ok) {
        throw new Error(`Failed to load threads: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error loading threads:", error);
      throw error;
    }
  };
}
```

### Custom Retry Configuration

```typescript
import { fetchWithRetry } from "@/shared/utils/retry";

const response = await fetchWithRetry(
  "/api/long-operation",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  },
  {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error.message);
    },
  }
);
```

### Handling Stream Events

```typescript
import { useStreamContext } from "@/core/providers/stream";

function ChatComponent() {
  const { streamRuns, state, error } = useStreamContext();

  const sendMessage = async (content: string) => {
    try {
      await streamRuns({
        input: {
          messages: [{ role: "user", content }],
        },
        stream_mode: "messages",
      });
    } catch (error) {
      console.error("Stream error:", error);
      // Error is automatically reported by stream provider
    }
  };
}
```

## Next Steps

- [Authentication](./16-authentication.md) - Auth0 OAuth2 flow and token management
- [Error Handling](./17-error-handling.md) - Comprehensive error handling patterns
