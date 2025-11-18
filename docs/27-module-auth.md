# Auth Module

## Overview

The auth module (`/home/user/tiler2-ui/src/features/auth/`) provides authentication functionality using Auth0. It handles user authentication, access token management, token refresh logic, and protected routes. The module is designed with graceful degradation, allowing the application to run in development mode without Auth0 configuration.

**Purpose**: Centralize all authentication logic, providing secure access token management with automatic refresh, error handling, and user session management through Auth0.

## Directory Structure

```
src/features/auth/
├── components/
│   ├── components/
│   │   ├── index.ts                    # Component exports
│   │   ├── user-avatar.tsx             # User avatar component
│   │   └── user-dropdown.tsx           # User dropdown menu
│   ├── index.tsx                       # Main component exports
│   ├── sidebar-user-profile.tsx        # Sidebar user profile with auth state
│   └── utils/
│       └── get-initials.ts             # Get user initials from name
├── config/
│   └── token-config.ts                 # Token timing configuration
├── hooks/
│   └── use-access-token.ts             # Hook for getting access tokens
├── services/
│   ├── auth0-client.tsx                # Client-side Auth0 utilities
│   ├── auth0-config.ts                 # Auth0 configuration
│   └── auth0.ts                        # Auth0 service interface
├── types/
│   └── index.ts                        # TypeScript types
├── utils/
│   ├── token-error-handler.ts          # Token error handling utilities
│   └── token-utils.ts                  # JWT token utilities
└── index.ts                            # Public API exports
```

## Core Concepts

### Why This Module Exists

1. **Centralized Authentication**: Single source of truth for all auth-related logic
2. **Token Management**: Automatic token refresh and expiration handling
3. **Security**: Proper error handling and token validation
4. **Developer Experience**: Graceful degradation in development without Auth0
5. **Consistency**: Standardized auth patterns across the application

## Key Components

### 1. Auth0 Integration

**File**: `/home/user/tiler2-ui/src/features/auth/services/auth0-client.tsx`

Provides client-side Auth0 utilities with graceful degradation for development:

```typescript
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

**Development Status Indicator**:
```typescript
export function Auth0DevStatus(): React.JSX.Element | null {
  if (!isDevelopment || isAuth0ConfiguredClient()) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 rounded-lg border border-yellow-400 bg-yellow-100 p-3 text-sm shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-yellow-600">⚠️</span>
        <span className="text-yellow-800">Auth0 not configured (dev mode)</span>
      </div>
    </div>
  );
}
```

### 2. useAccessToken Hook

**File**: `/home/user/tiler2-ui/src/features/auth/hooks/use-access-token.ts`

Core hook for safely getting access tokens with automatic error handling:

```typescript
interface UseAccessTokenOptions {
  component?: string;
  operation?: string;
}

interface UseAccessTokenResult {
  /**
   * Get an access token safely with error handling
   * Returns null if token error occurs (user will be redirected to login)
   */
  getToken: () => Promise<string | null>;
}

export const useAccessToken = (
  options: UseAccessTokenOptions = {},
): UseAccessTokenResult => {
  const { component = "useAccessToken", operation = "getAccessToken" } =
    options;
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
        return null;
      }
      throw error;
    }
  }, [component, operation, getAccessTokenSilently]);

  return {
    getToken,
  };
};
```

**Usage Example**:
```typescript
function MyComponent() {
  const { getToken } = useAccessToken({
    component: 'MyComponent',
    operation: 'fetchUserData'
  });

  const fetchData = async () => {
    const token = await getToken();
    if (!token) {
      // User will be redirected to login
      return;
    }

    const response = await fetch('/api/data', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };
}
```

### 3. Token Management

#### Token Configuration

**File**: `/home/user/tiler2-ui/src/features/auth/config/token-config.ts`

Dynamic token timing configuration following Auth0 best practices:

```typescript
export const DEFAULT_LATENCY_BUFFER_SECONDS = 60;

export interface TokenTimings {
  /** Actual token lifetime in seconds (from issue to expiration) */
  lifetimeSeconds: number;

  /** How often to check/refresh the token in background (2/3 of lifetime) */
  refreshIntervalSeconds: number;

  /** Buffer time before expiry to consider token "expiring soon" */
  expiryBufferSeconds: number;

  /** Minimal buffer for urgent checks */
  minimalBufferSeconds: number;

  /** Refresh interval in milliseconds for JavaScript timers */
  refreshIntervalMs: number;
}

export function calculateTokenTimings(expiresAt: number): TokenTimings {
  const now = Math.floor(Date.now() / 1000);
  const lifetimeSeconds = Math.max(0, expiresAt - now);
  const expiryBufferSeconds =
    lifetimeSeconds < SHORT_LIVED_TOKEN_SECONDS
      ? Math.min(DEFAULT_LATENCY_BUFFER_SECONDS, lifetimeSeconds * 0.5)
      : Math.floor(lifetimeSeconds / 5);
  const refreshIntervalSeconds = Math.floor(lifetimeSeconds * REFRESH_RATIO);
  const minimalBufferSeconds = Math.min(
    MAX_MINIMAL_BUFFER_SECONDS,
    Math.floor(lifetimeSeconds * URGENT_BUFFER_RATIO),
  );

  return {
    lifetimeSeconds,
    refreshIntervalSeconds,
    expiryBufferSeconds,
    minimalBufferSeconds,
    refreshIntervalMs: Math.floor(refreshIntervalSeconds * 1000),
  };
}
```

#### Token Utilities

**File**: `/home/user/tiler2-ui/src/features/auth/utils/token-utils.ts`

JWT token utilities for checking expiration and decoding:

```typescript
/**
 * Decode a JWT token without verification (client-side only)
 * WARNING: This does NOT verify the signature - only use for reading claims
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), {
      operation: "decode_jwt",
    });
    return null;
  }
}

/**
 * Check if a JWT token is expired or will expire soon
 */
export function checkTokenExpiry(
  token: string,
  bufferSeconds: number = DEFAULT_LATENCY_BUFFER_SECONDS,
): {
  isExpired: boolean;
  isExpiringSoon: boolean;
  expiresAt: Date | null;
  secondsUntilExpiry: number | null;
} {
  const payload = decodeJwt(token);

  if (!payload || !payload.exp) {
    return {
      isExpired: true,
      isExpiringSoon: true,
      expiresAt: null,
      secondsUntilExpiry: null,
    };
  }

  const expiresAt = new Date(payload.exp * 1000);
  const now = Date.now();
  const secondsUntilExpiry = Math.floor((expiresAt.getTime() - now) / 1000);

  return {
    isExpired: secondsUntilExpiry <= 0,
    isExpiringSoon: secondsUntilExpiry <= bufferSeconds,
    expiresAt,
    secondsUntilExpiry,
  };
}
```

### 4. Token Error Handling

**File**: `/home/user/tiler2-ui/src/features/auth/utils/token-error-handler.ts`

Centralized error handling for Auth0 token errors:

```typescript
export const isAccessTokenError = (error: unknown): error is Error => {
  return error instanceof Error && error.name === "AccessTokenError";
};

/**
 * Handles Auth0 token errors consistently across the application
 * @returns true if the error was handled, false otherwise
 */
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

/**
 * Wraps an async function that may throw AccessTokenError
 * Automatically handles token errors and redirects to login
 */
export const withTokenErrorHandling = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context: TokenErrorContext = {},
) => {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (handleTokenError(error, context)) {
        return null;
      }
      throw error;
    }
  };
};
```

### 5. User Profile Component

**File**: `/home/user/tiler2-ui/src/features/auth/components/sidebar-user-profile.tsx`

Sidebar component showing user authentication state:

```typescript
export const SidebarUserProfile = (): React.JSX.Element => {
  const { user, isLoading } = useAuth0();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isLoading) {
    return <LoadingProfile />;
  }

  if (!user) {
    return <GuestProfile isCollapsed={isCollapsed} />;
  }

  const initials = getInitials(user.name || user.email || "User");
  const displayName = user.name || user.email || "User";

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <Avatar className="size-6">
                  {user.picture && (
                    <AvatarImage src={user.picture} alt={displayName} />
                  )}
                  <AvatarFallback className="bg-sage/20 text-sage text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{displayName}</span>
                <ChevronDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/auth/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};
```

## Types and Interfaces

**File**: `/home/user/tiler2-ui/src/features/auth/types/index.ts`

```typescript
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthConfig {
  domain: string;
  clientId: string;
  clientSecret: string;
  secret: string;
  baseUrl: string;
  audience?: string;
}

export interface AuthSession {
  rollingDuration: number;
  absoluteDuration: number;
  cookie: {
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    httpOnly: boolean;
  };
}

export interface AuthorizationParams {
  scope: string;
  audience?: string;
  redirect_uri?: string;
}
```

## Public API

**File**: `/home/user/tiler2-ui/src/features/auth/index.ts`

The module exports a clean public API:

```typescript
// Components
export { AuthButtons } from "./components";

// Services
export { getAuth0, isAuth0Configured, getAuth0Config } from "./services/auth0";
export { AUTH0_CONFIG } from "./services/auth0-config";

// Token Configuration
export {
  calculateTokenTimings,
  DEFAULT_LATENCY_BUFFER_SECONDS,
} from "./config/token-config";
export type { TokenTimings } from "./config/token-config";

// Error Handling
export {
  handleTokenError,
  isAccessTokenError,
  withTokenErrorHandling,
  withSyncTokenErrorHandling,
} from "./utils/token-error-handler";
export type { TokenErrorContext } from "./utils/token-error-handler";

// Token Utilities
export { checkTokenExpiry, decodeJwt, getTokenInfo } from "./utils/token-utils";

// Types
export type {
  AuthUser,
  AuthState,
  AuthConfig,
  AuthSession,
  AuthorizationParams,
} from "./types";

// Hooks
export { useAccessToken } from "./hooks/use-access-token";
```

## Integration with Other Modules

### StreamProvider Integration
The auth module integrates with the streaming provider to include access tokens in API requests:

```typescript
import { useAccessToken } from '@/features/auth';

function StreamProvider() {
  const { getToken } = useAccessToken({
    component: 'StreamProvider',
    operation: 'stream'
  });

  const makeRequest = async () => {
    const token = await getToken();
    // Use token in streaming request
  };
}
```

### Protected API Calls
All API calls that require authentication use the `useAccessToken` hook:

```typescript
import { useAccessToken } from '@/features/auth';

function useProtectedAPI() {
  const { getToken } = useAccessToken({
    component: 'ProtectedAPI',
    operation: 'fetchData'
  });

  const fetchProtectedData = async () => {
    const token = await getToken();
    if (!token) return; // User redirected to login

    const response = await fetch('/api/protected', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };
}
```

## Best Practices

1. **Always use useAccessToken**: Never access tokens directly from Auth0
2. **Provide context**: Include component and operation names for better error tracking
3. **Handle null returns**: `getToken()` may return null if authentication fails
4. **Token refresh**: Tokens are refreshed automatically by Auth0 SDK
5. **Error tracking**: All token errors are logged to observability service

## Configuration

Required environment variables:
- `AUTH0_DOMAIN`: Your Auth0 tenant domain
- `AUTH0_CLIENT_ID`: Auth0 application client ID
- `AUTH0_CLIENT_SECRET`: Auth0 application client secret (server-side)
- `AUTH0_SECRET`: Session encryption secret
- `AUTH0_AUDIENCE`: API audience for token validation
- `APP_BASE_URL`: Application base URL for redirects

## Development Mode

The module supports running without Auth0 configuration in development:
- Checks `env.AUTH0_DOMAIN` and `env.AUTH0_CLIENT_ID`
- Shows warning banner if not configured
- Logs missing environment variables
- Allows application to run for local development

## Next Steps

**Next**: [Chat Module](/home/user/tiler2-ui/docs/28-module-chat.md) - Learn about the chat input and message composition system
