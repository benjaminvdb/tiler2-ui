# Authentication

This document covers the authentication system, including Auth0 OAuth2 integration, token management, protected routes, and security best practices.

## Auth0 OAuth2 Flow (PKCE)

The application uses Auth0 with the Authorization Code Flow with PKCE (Proof Key for Code Exchange), which is the recommended authentication method for Single-Page Applications (SPAs).

**WHY PKCE**: PKCE prevents authorization code interception attacks by using a dynamically-generated secret that is tied to each authorization request. This is critical for SPAs which cannot securely store client secrets.

### Flow Overview

1. **User Initiates Login**: User clicks "Log In" or accesses protected route
2. **Authorization Request**: App redirects to Auth0 with PKCE code challenge
3. **User Authentication**: User authenticates with Auth0 (login page)
4. **Authorization Code**: Auth0 redirects back with authorization code
5. **Token Exchange**: App exchanges code + verifier for tokens
6. **Token Storage**: Auth0 SDK securely stores tokens in memory/storage
7. **API Requests**: Access token included in Authorization header

### Auth0Provider Setup

Located at `/home/user/tiler2-ui/src/features/auth/services/auth0-client.tsx`:

```typescript
import { Auth0Provider } from "@auth0/auth0-react";
import { env } from "@/env";

<Auth0Provider
  domain={env.AUTH0_DOMAIN}
  clientId={env.AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: `${env.APP_BASE_URL}/callback`,
    audience: env.AUTH0_AUDIENCE,
    scope: "openid profile email offline_access",
  }}
  useRefreshTokens={true}
  cacheLocation="localstorage"
>
  {children}
</Auth0Provider>
```

**Configuration Breakdown**:
- `domain`: Your Auth0 tenant domain (e.g., `your-tenant.auth0.com`)
- `clientId`: Application client ID from Auth0 dashboard
- `redirect_uri`: Where Auth0 redirects after authentication
- `audience`: API audience identifier (for access token)
- `scope`: Requested permissions (OpenID Connect + API scopes)
- `useRefreshTokens`: Enable refresh token rotation
- `cacheLocation`: Where to store tokens (`localstorage` or `memory`)

### Session Configuration

From `/home/user/tiler2-ui/src/features/auth/services/auth0-config.ts`:

```typescript
const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_DAY = SECONDS_PER_HOUR * 24;

export const AUTH0_CONFIG = {
  session: {
    rollingDuration: 24 * SECONDS_PER_HOUR,    // 24 hours
    absoluteDuration: 7 * SECONDS_PER_DAY,      // 7 days max
    cookie: {
      secure: import.meta.env.MODE === "production",
      sameSite: "lax" as const,
      httpOnly: true,
    },
  },
  authorizationParams: {
    scope: "openid profile email offline_access",
  },
};
```

**WHY Rolling Duration**: Sessions extend automatically with activity, keeping active users logged in while still enforcing a maximum session lifetime.

## Token Management

### Access Tokens

**Purpose**: Authorize API requests to the LangGraph backend.

**Lifetime**: Short-lived (typically 1 hour)

**Storage**: Managed by Auth0 SDK (localstorage or memory)

**Format**: JWT (JSON Web Token) with claims:
```json
{
  "iss": "https://your-tenant.auth0.com/",
  "sub": "auth0|user-id",
  "aud": "https://api.example.com",
  "exp": 1234567890,
  "iat": 1234564290,
  "scope": "openid profile email"
}
```

### Refresh Tokens

**Purpose**: Obtain new access tokens without re-authentication.

**Lifetime**: Long-lived (7 days with rotation)

**Storage**: Securely managed by Auth0 SDK

**WHY Rotation**: Refresh token rotation limits the window of vulnerability if a token is compromised. Each refresh token can only be used once.

### Getting Access Tokens

#### useAccessToken Hook

From `/home/user/tiler2-ui/src/features/auth/hooks/use-access-token.ts`:

```typescript
import { useAccessToken } from "@/features/auth/hooks/use-access-token";

export const useAccessToken = (
  options: UseAccessTokenOptions = {},
): UseAccessTokenResult => {
  const { component = "useAccessToken", operation = "getAccessToken" } = options;
  const { getAccessTokenSilently } = useAuth0();

  const getToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: env.AUTH0_AUDIENCE,
        },
      });
      return token;
    } catch (error) {
      if (handleTokenError(error, { component, operation })) {
        return null;  // User redirected to login
      }
      throw error;
    }
  }, [component, operation, getAccessTokenSilently]);

  return { getToken };
};
```

**Usage**:
```typescript
function MyComponent() {
  const { getToken } = useAccessToken({
    component: "MyComponent",
    operation: "loadData",
  });

  const loadData = async () => {
    const token = await getToken();
    if (!token) return;  // User was redirected to login

    // Use token for API call
    const response = await fetch("/api/data", {
      headers: { Authorization: `Bearer ${token}` },
    });
  };
}
```

#### Direct SDK Usage

```typescript
import { useAuth0 } from "@auth0/auth0-react";

function MyComponent() {
  const { getAccessTokenSilently } = useAuth0();

  const getToken = async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: env.AUTH0_AUDIENCE,
        },
      });
      return token;
    } catch (error) {
      console.error("Failed to get token:", error);
      throw error;
    }
  };
}
```

## Silent Authentication

**Silent authentication** obtains new tokens without user interaction, using iframes and hidden prompts.

### How It Works

1. **Token Expires**: Access token approaches expiration
2. **Silent Refresh**: SDK silently requests new token using refresh token
3. **Success**: New token obtained transparently
4. **Failure**: User redirected to login if refresh fails

### Implementation

```typescript
const { getAccessTokenSilently } = useAuth0();

// This automatically uses silent authentication
const token = await getAccessTokenSilently({
  authorizationParams: {
    audience: env.AUTH0_AUDIENCE,
  },
});
```

**WHY Silent Auth**: Provides seamless user experience by automatically refreshing tokens without interrupting the user's workflow.

## Token Refresh Strategy

### Automatic Refresh

The Auth0 SDK automatically handles token refresh:

1. **Before Expiration**: SDK checks token expiration before each API call
2. **Refresh Window**: Tokens are refreshed 5-10 minutes before expiration
3. **Retry Logic**: If refresh fails, HTTP client retries with fresh token

### Manual Refresh on 403

From `/home/user/tiler2-ui/src/core/services/http-client.ts`:

```typescript
// On 403 error, attempt token refresh
if (response.status === 403 && !skip403Retry) {
  logForbiddenRetry(url, "pending");

  try {
    const newToken = await getToken();  // Fetch fresh token
    requestHeaders.Authorization = `Bearer ${newToken}`;

    const retryResponse = await executeRequest(fetchOptions.signal ?? undefined);

    if (retryResponse.status === 403) {
      // Persistent 403 - logout user
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

**WHY**: This handles race conditions where a token expires between the expiration check and the actual API call.

## Logout Flow

### Client-Side Logout

```typescript
import { useAuth0 } from "@auth0/auth0-react";

function LogoutButton() {
  const { logout } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return <button onClick={handleLogout}>Log Out</button>;
}
```

### Silent Logout (Automatic)

Triggered automatically on authentication failures:

```typescript
function triggerSilentLogout(reason: string): void {
  reportAuthError(new Error(`Silent logout triggered: ${reason}`), {
    operation: "silentLogout",
    component: "http-client",
    additionalData: {
      severity: "high",
      reason,
    },
  });

  window.location.href = "/api/auth/logout";
}
```

**Triggers**:
- Persistent 403 errors after token refresh
- AccessTokenError exceptions
- Refresh token expiration
- Invalid or malformed tokens

### Server-Side Logout Endpoint

**Endpoint**: `GET /api/auth/logout`

Clears server-side session cookies and redirects to Auth0 logout URL.

## Protected Routes

Routes are protected by checking authentication state before rendering:

```typescript
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

**Usage**:
```typescript
<Route path="/chat" element={
  <ProtectedRoute>
    <ChatPage />
  </ProtectedRoute>
} />
```

## Token in API Requests

### Using useAuthenticatedFetch

The recommended approach for making authenticated API calls:

```typescript
import { useAuthenticatedFetch } from "@/core/services/http-client";

function MyComponent() {
  const fetch = useAuthenticatedFetch();

  const loadData = async () => {
    // Token automatically injected
    const response = await fetch("/api/threads/search");
    const data = await response.json();
    return data;
  };
}
```

### Manual Token Injection

For cases where you need direct control:

```typescript
import { useAccessToken } from "@/features/auth/hooks/use-access-token";

function MyComponent() {
  const { getToken } = useAccessToken();

  const loadData = async () => {
    const token = await getToken();
    if (!token) return;

    const response = await fetch("/api/data", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return await response.json();
  };
}
```

### LangGraph SDK Integration

The stream provider automatically injects tokens:

```typescript
// /home/user/tiler2-ui/src/core/providers/stream/stream-session.tsx
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

## Auth Callback Handling

### Callback Route

**Path**: `/callback`

Handles the redirect from Auth0 after successful authentication.

### Implementation

```typescript
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CallbackPage() {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      console.error("Auth callback error:", error);
      navigate("/login");
      return;
    }

    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, error, navigate]);

  return <LoadingSpinner />;
}
```

### Error Handling

If authentication fails during callback:

1. **Error Logged**: Auth error reported to Sentry
2. **User Notified**: Toast notification with error message
3. **Redirect**: User sent back to login page
4. **State Cleared**: Any partial auth state is cleared

## Token Error Handling

### AccessTokenError Detection

From `/home/user/tiler2-ui/src/features/auth/utils/token-error-handler.ts`:

```typescript
export const isAccessTokenError = (error: unknown): error is Error => {
  return error instanceof Error && error.name === "AccessTokenError";
};

export const handleTokenError = (
  error: unknown,
  { operation = "unknown", component = "unknown", additionalData }: TokenErrorContext = {},
): boolean => {
  if (!isAccessTokenError(error)) {
    return false;
  }

  reportAuthError(error, {
    operation,
    component,
    additionalData: {
      errorType: "AccessTokenError",
      ...additionalData,
    },
  });

  if (typeof window !== "undefined") {
    window.location.href = "/api/auth/login";
  }

  return true;
};
```

### Error Boundary Integration

From `/home/user/tiler2-ui/src/shared/components/error-boundary/global-error-boundary.tsx`:

```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  if (error.name === "AccessTokenError") {
    window.location.href = "/api/auth/login";
    return;
  }

  // Handle other errors...
}
```

**WHY**: AccessTokenError is caught early and triggers immediate re-authentication before the error propagates and breaks the UI.

## Security Best Practices

### Token Storage

**DO**:
- Use `localstorage` for web apps (Auth0 SDK handles it securely)
- Use `memory` storage for maximum security (requires re-auth on refresh)
- Enable refresh token rotation
- Use short-lived access tokens (1 hour or less)

**DON'T**:
- Don't store tokens in plain cookies without httpOnly flag
- Don't store tokens in sessionStorage for long-term use
- Don't log tokens to console or error tracking
- Don't embed tokens in URLs or query parameters

### Token Transmission

**DO**:
- Always use HTTPS in production
- Use `Authorization: Bearer` header for API requests
- Set appropriate CORS policies on backend
- Validate tokens on every API request (backend)

**DON'T**:
- Don't send tokens in URL query parameters
- Don't cache responses containing tokens
- Don't expose tokens in client-side JavaScript globals

### Session Management

**DO**:
- Implement absolute session timeout (7 days max)
- Use rolling sessions for active users
- Clear all auth state on logout
- Implement CSRF protection for state-changing operations

**DON'T**:
- Don't allow infinite session duration
- Don't trust client-side session state alone
- Don't skip token validation on backend
- Don't reuse authorization codes or refresh tokens

### Error Handling

**DO**:
- Log authentication errors to monitoring system
- Provide clear error messages to users
- Implement automatic retry with backoff
- Gracefully handle token expiration

**DON'T**:
- Don't expose token details in error messages
- Don't retry indefinitely on auth failures
- Don't ignore 401/403 responses
- Don't cache failed authentication attempts

## Development vs Production

### Development Mode

- Auth0 configuration is optional (graceful degradation)
- Warning banner displayed if Auth0 not configured
- Some features may be disabled without authentication

```typescript
// /home/user/tiler2-ui/src/features/auth/services/auth0-client.tsx
export function isAuth0ConfiguredClient(): boolean {
  return Boolean(env.AUTH0_DOMAIN && env.AUTH0_CLIENT_ID);
}

export function warnAuth0NotConfigured(): void {
  if (!isDevelopment || isAuth0ConfiguredClient()) {
    return;
  }

  logger.warn("Auth0 not configured - running without authentication", {
    operation: "auth0_config_check",
    additionalData: {
      requiredVars: [
        "AUTH0_DOMAIN",
        "AUTH0_CLIENT_ID",
        "AUTH0_CLIENT_SECRET",
        "AUTH0_SECRET",
        "APP_BASE_URL",
      ],
    },
  });
}
```

### Production Mode

- Auth0 configuration is required
- All tokens transmitted over HTTPS
- Secure cookie settings enforced
- Session security settings enabled

## Code Examples

### Complete Authentication Flow

```typescript
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthenticatedFetch } from "@/core/services/http-client";

function ChatComponent() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  const fetch = useAuthenticatedFetch();

  // Wait for auth to initialize
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  const sendMessage = async (content: string) => {
    try {
      // Token automatically included
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      return await response.json();
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  };

  return (
    <div>
      <p>Logged in as: {user?.email}</p>
      <button onClick={() => logout()}>Log Out</button>
    </div>
  );
}
```

### Custom Token Hook with Caching

```typescript
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useRef } from "react";

function useTokenWithCache() {
  const { getAccessTokenSilently } = useAuth0();
  const tokenCacheRef = useRef<{ token: string; expiresAt: number } | null>(null);

  const getToken = useCallback(async () => {
    const now = Date.now();

    // Return cached token if still valid (5 min buffer)
    if (tokenCacheRef.current && tokenCacheRef.current.expiresAt > now + 300000) {
      return tokenCacheRef.current.token;
    }

    // Fetch new token
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: env.AUTH0_AUDIENCE,
      },
    });

    // Decode and cache (simplified - use jwt-decode in production)
    const payload = JSON.parse(atob(token.split(".")[1]));
    tokenCacheRef.current = {
      token,
      expiresAt: payload.exp * 1000,
    };

    return token;
  }, [getAccessTokenSilently]);

  return getToken;
}
```

## Next Steps

- [API Integration](./15-api-integration.md) - HTTP client and API integration
- [Error Handling](./17-error-handling.md) - Error boundaries and recovery patterns
