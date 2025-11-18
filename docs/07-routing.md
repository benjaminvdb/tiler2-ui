# Routing and Navigation

This document provides comprehensive documentation of routing implementation, navigation patterns, and URL-based state management using React Router v7.

## Table of Contents

- [Routing Overview](#routing-overview)
- [React Router v7 Configuration](#react-router-v7-configuration)
- [Route Definitions](#route-definitions)
- [URL-Based State Management](#url-based-state-management)
- [Navigation Patterns](#navigation-patterns)
- [Protected Routes](#protected-routes)
- [Route Utilities and Hooks](#route-utilities-and-hooks)
- [Deep Linking](#deep-linking)
- [Code Examples](#code-examples)
- [Best Practices](#best-practices)

## Routing Overview

The application uses **React Router v7** with a **URL-first approach** where the URL is the primary source of truth for application state.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      URL Bar                             │
│  https://app.com/?threadId=abc&chatHistoryOpen=true     │
└─────────────────────────────────────────────────────────┘
                        │
                        │ React Router
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Route Matching                         │
│  / → ThreadsPage                                         │
│  /workflows → WorkflowsPage                              │
│  /auth/callback → CallbackPage                           │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              URL Parameter Parsing                       │
│  threadId: 'abc'                                         │
│  chatHistoryOpen: true                                   │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Component Rendering                         │
│  Page component with state from URL                      │
└─────────────────────────────────────────────────────────┘
```

**WHY URL-first routing:**
- **Deep linking**: Direct navigation to specific app states
- **Browser history**: Back/forward buttons work naturally
- **Shareability**: Users can share exact application state
- **Persistence**: State survives page refresh
- **Simplicity**: No complex state synchronization needed

## React Router v7 Configuration

### Entry Point Setup

```typescript
// /home/user/tiler2-ui/src/main.tsx
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div>An error occurred</div>}>
      <BrowserRouter>
        <Auth0ProviderWithNavigate>
          <App />
        </Auth0ProviderWithNavigate>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
);
```

**Key points:**
- **BrowserRouter**: Uses HTML5 history API for clean URLs
- **Sentry.ErrorBoundary**: Catches and reports routing errors
- **Auth0ProviderWithNavigate**: Auth provider with React Router integration

### Auth0 Integration

```typescript
// /home/user/tiler2-ui/src/main.tsx
function Auth0ProviderWithNavigate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const onRedirectCallback = useCallback(
    (appState?: AppState) => {
      // Use React Router's navigate instead of window.location
      navigate(appState?.returnTo || window.location.pathname, {
        replace: true,
      });
    },
    [navigate],
  );

  return (
    <Auth0Provider
      domain={env.AUTH0_DOMAIN}
      clientId={env.AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/auth/callback`,
        audience: env.AUTH0_AUDIENCE,
      }}
      onRedirectCallback={onRedirectCallback}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
```

**WHY this integration:**
- **Proper history**: Uses React Router's navigate, not window.location
- **Prevents loops**: Replace flag prevents infinite loading
- **returnTo support**: Preserves destination after login

## Route Definitions

### Route Structure

```typescript
// /home/user/tiler2-ui/src/App.tsx
export function App() {
  return (
    <MotionConfigProvider>
      <GlobalErrorBoundary>
        <AsyncErrorBoundary>
          <NetworkStatusProvider>
            <SentryUserContext />
            <Routes>
              {/* Home page - main chat interface */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ThreadsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Workflows selection page */}
              <Route
                path="/workflows"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <WorkflowsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Auth0 callback page */}
              <Route
                path="/auth/callback"
                element={<CallbackPage />}
              />

              {/* Catch-all redirect to home */}
              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </NetworkStatusProvider>
        </AsyncErrorBoundary>
      </GlobalErrorBoundary>
    </MotionConfigProvider>
  );
}
```

### Route Constants

```typescript
// /home/user/tiler2-ui/src/core/routing/routes.ts
export const ROUTES = {
  HOME: '/',
  WORKFLOWS: '/workflows',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
```

**WHY route constants:**
- **Type safety**: TypeScript enforces valid routes
- **Single source of truth**: Change route in one place
- **Refactoring**: Easy to update routes across codebase

### Route Descriptions

| Route | Component | Description | Protected |
|-------|-----------|-------------|-----------|
| `/` | ThreadsPage | Main chat interface with thread display | Yes |
| `/workflows` | WorkflowsPage | Workflow selection catalog | Yes |
| `/auth/callback` | CallbackPage | Auth0 OAuth callback handler | No |
| `*` | Navigate to `/` | Catch-all redirect to home | No |

## URL-Based State Management

### Search Parameter Schema

```typescript
// /home/user/tiler2-ui/src/core/routing/search-params.ts
import { z } from 'zod';

export const SearchParamsSchema = z.object({
  threadId: z.string().optional(),              // Current conversation ID
  chatHistoryOpen: z.coerce.boolean().optional(), // Sidebar open/closed
  hideToolCalls: z.coerce.boolean().optional(),   // Tool call visibility
  workflow: z.string().optional(),                // Workflow initialization
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;
export type SearchParamKey = keyof SearchParams;
```

**WHY Zod validation:**
- **Runtime validation**: Catch invalid URL parameters
- **Type inference**: TypeScript types from schema
- **Type coercion**: Convert strings to booleans/numbers

### URL State Examples

```
# New conversation (no parameters)
https://app.com/

# Specific conversation
https://app.com/?threadId=abc123

# Conversation with sidebar open
https://app.com/?threadId=abc123&chatHistoryOpen=true

# Hide tool calls
https://app.com/?threadId=abc123&hideToolCalls=true

# Workflow initialization
https://app.com/?workflow=onboarding-workflow

# Multiple parameters
https://app.com/?threadId=abc123&chatHistoryOpen=true&hideToolCalls=true
```

### Parameter Parsing

```typescript
// /home/user/tiler2-ui/src/core/routing/search-params.ts
export function parseSearchParams(searchParams: URLSearchParams): SearchParams {
  const params: Record<string, string | boolean | undefined> = {};

  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  const result = SearchParamsSchema.safeParse(params);

  if (result.success) {
    return result.data;
  }

  console.warn('Invalid search params:', result.error);
  return {};
}
```

### Parameter Serialization

```typescript
// /home/user/tiler2-ui/src/core/routing/search-params.ts
export function serializeSearchParams(params: Partial<SearchParams>): string {
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      urlParams.set(key, String(value));
    }
  }

  return urlParams.toString();
}
```

## Navigation Patterns

### Navigation Service

Type-safe navigation service with helper methods:

```typescript
// /home/user/tiler2-ui/src/core/services/navigation.ts
export interface NavigationService {
  navigateToHome: (options?: { threadId?: string }) => void;
  navigateToWorkflows: (params?: Partial<SearchParams>) => void;
  navigateToWorkflow: (workflowId: string) => void;
  isHomePage: (pathname: string) => boolean;
  isWorkflowsPage: (pathname: string) => boolean;
}

export function createNavigationService(
  router: NavigateFunction,
): NavigationService {
  const navigateToHome = (options?: { threadId?: string }) => {
    const params: Partial<SearchParams> = {
      threadId: options?.threadId,
      workflow: undefined,  // Clear workflow
    };
    const url = buildPreservedUrl(ROUTES.HOME, params);
    router(url);
  };

  const navigateToWorkflows = (params?: Partial<SearchParams>) => {
    const url = buildPreservedUrl(ROUTES.WORKFLOWS, params);
    router(url);
  };

  const navigateToWorkflow = (workflowId: string) => {
    const url = buildPreservedUrl(ROUTES.HOME, {
      workflow: workflowId,
      threadId: undefined,  // Clear thread
    });
    router(url);
  };

  return {
    navigateToHome,
    navigateToWorkflows,
    navigateToWorkflow,
    isHomePage: (pathname) => pathname === ROUTES.HOME,
    isWorkflowsPage: (pathname) => pathname === ROUTES.WORKFLOWS,
  };
}
```

**WHY navigation service:**
- **Type safety**: TypeScript enforces valid parameters
- **Centralized**: All navigation logic in one place
- **Testable**: Easy to mock in tests
- **Consistent**: Same navigation API across app

### Preserved URL Parameters

```typescript
// /home/user/tiler2-ui/src/core/routing/utils.ts
export function mergeSearchParams(
  current: URLSearchParams,
  updates: Partial<SearchParams>,
): URLSearchParams {
  const merged = new URLSearchParams(current);

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null) {
      merged.delete(key);  // Remove parameter
    } else {
      merged.set(key, String(value));  // Update parameter
    }
  }

  return merged;
}
```

**WHY preserve parameters:**
- **Context preservation**: Keep unrelated parameters
- **Partial updates**: Only change what's needed
- **User experience**: Maintain user preferences

### Usage Examples

```typescript
// In components
const { navigationService } = useUIContext();

// Navigate to home (clear all params)
navigationService.navigateToHome();

// Navigate to home with specific thread
navigationService.navigateToHome({ threadId: 'abc123' });

// Navigate to workflows
navigationService.navigateToWorkflows();

// Start a workflow
navigationService.navigateToWorkflow('onboarding-workflow');

// Check current page
const isHome = navigationService.isHomePage(location.pathname);
```

## Protected Routes

### ProtectedRoute Component

```typescript
// /home/user/tiler2-ui/src/App.tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  }, [isAuthenticated, isLoading, loginWithRedirect]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
```

**How it works:**
1. Check Auth0 authentication status
2. If loading, show loading screen
3. If not authenticated, redirect to Auth0 login
4. Preserve current path in `returnTo` for post-login redirect
5. If authenticated, render children

### Callback Page

```typescript
// /home/user/tiler2-ui/src/App.tsx
function CallbackPage(): React.JSX.Element {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        console.error('Auth0 callback error:', error);
        navigate('/', { replace: true });  // Navigate to home on error
      } else if (isAuthenticated) {
        navigate('/', { replace: true });  // Navigate to home when auth complete
      }
    }
  }, [isLoading, isAuthenticated, error, navigate]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Authentication error occurred</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
}
```

**WHY callback page:**
- **OAuth flow**: Required for Auth0 redirect-based authentication
- **Error handling**: Display errors gracefully
- **Backup navigation**: Ensures navigation even if callback fails
- **Loading state**: Shows feedback during auth processing

## Route Utilities and Hooks

### useSearchParamState Hook

Primary hook for URL state management:

```typescript
// /home/user/tiler2-ui/src/core/routing/hooks/use-search-params-state.ts
export function useSearchParamState<K extends SearchParamKey>(
  key: K,
): [
  Exclude<SearchParams[K], undefined> | null,
  (value: Exclude<SearchParams[K], undefined> | null) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key);

  const setValue = useCallback(
    (newValue: SearchParams[K] | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          if (newValue === null || newValue === undefined) {
            next.delete(key);  // Remove parameter
          } else {
            next.set(key, String(newValue));  // Set parameter
          }

          return next;
        },
        { replace: true },  // Replace history entry (no spam)
      );
    },
    [key, setSearchParams],
  );

  return [parseSearchParamValue(key, value), setValue];
}
```

**Key features:**
- **useState-like API**: Familiar React pattern
- **Type safety**: Typed parameter keys and values
- **Automatic parsing**: Converts strings to correct types
- **History management**: Uses `replace` to prevent back button spam

### useSearchParamsUpdate Hook

Bulk update multiple parameters:

```typescript
// /home/user/tiler2-ui/src/core/routing/hooks/use-search-params-state.ts
export function useSearchParamsUpdate(): (
  updates: Partial<SearchParams>,
) => void {
  const [searchParams, setSearchParams] = useSearchParams();

  const baseParams = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  return useCallback(
    (updates: Partial<SearchParams>) => {
      setSearchParams(
        () => {
          const merged = mergeSearchParams(baseParams, updates);
          return merged;
        },
        { replace: true },
      );
    },
    [baseParams, setSearchParams],
  );
}
```

**WHY separate hook:**
- **Atomic updates**: Change multiple parameters at once
- **Efficiency**: Single history entry for multiple changes
- **Consistency**: All updates happen together

### useSearchParamsObject Hook

Get all parameters as typed object:

```typescript
// /home/user/tiler2-ui/src/core/routing/hooks/use-search-params-state.ts
export function useSearchParamsObject(): Partial<SearchParams> {
  const [searchParams] = useSearchParams();
  const params: Partial<SearchParams> = {};

  if (searchParams.has('threadId')) {
    params.threadId = searchParams.get('threadId') || undefined;
  }
  if (searchParams.has('chatHistoryOpen')) {
    params.chatHistoryOpen = searchParams.get('chatHistoryOpen') === 'true';
  }
  if (searchParams.has('hideToolCalls')) {
    params.hideToolCalls = searchParams.get('hideToolCalls') === 'true';
  }
  if (searchParams.has('workflow')) {
    params.workflow = searchParams.get('workflow') || undefined;
  }

  return params;
}
```

### useNavigate Hook (React Router)

Direct access to React Router's navigate function:

```typescript
import { useNavigate } from 'react-router-dom';

function Component() {
  const navigate = useNavigate();

  // Navigate to route
  navigate('/workflows');

  // Navigate with replace (no history entry)
  navigate('/', { replace: true });

  // Navigate back
  navigate(-1);

  // Navigate forward
  navigate(1);
}
```

## Deep Linking

### Thread Deep Links

```
# Link to specific thread
https://app.com/?threadId=abc123

# Link to thread with sidebar open
https://app.com/?threadId=abc123&chatHistoryOpen=true
```

**Implementation:**

```typescript
// URL parameter triggers data fetch
const [threadId] = useSearchParamState('threadId');

useEffect(() => {
  if (threadId) {
    // Fetch thread history
    fetchThreadHistory(threadId);
  }
}, [threadId]);
```

### Workflow Deep Links

```
# Link to workflow
https://app.com/?workflow=onboarding-workflow
```

**Implementation:**

```typescript
// /home/user/tiler2-ui/src/app/page.tsx
const [searchParams] = useSearchParams();
const workflowId = searchParams.get('workflow');

useEffect(() => {
  if (workflowId && !isSubmittingWorkflow) {
    // Initialize workflow
    submitWorkflow(workflowId);
  }
}, [workflowId]);
```

### Shareable Links

All application state can be shared via URL:

```
# Complete state example
https://app.com/?threadId=abc123&chatHistoryOpen=true&hideToolCalls=false
```

**WHY deep linking:**
- **Shareability**: Users can share exact application state
- **Bookmarks**: Users can save specific views
- **External links**: Other apps can link to specific states
- **Testing**: QA can link to specific scenarios

## Code Examples

### Example 1: Basic Navigation

```typescript
function NavigationButtons() {
  const { navigationService } = useUIContext();

  return (
    <>
      {/* Navigate to home */}
      <button onClick={() => navigationService.navigateToHome()}>
        Home
      </button>

      {/* Navigate to workflows */}
      <button onClick={() => navigationService.navigateToWorkflows()}>
        Workflows
      </button>

      {/* Start new thread */}
      <button onClick={() => navigationService.navigateToHome({ threadId: undefined })}>
        New Thread
      </button>
    </>
  );
}
```

### Example 2: URL State Management

```typescript
function ThreadPage() {
  // Read thread ID from URL
  const [threadId, setThreadId] = useSearchParamState('threadId');

  // Read sidebar state from URL
  const [chatHistoryOpen, setChatHistoryOpen] = useSearchParamState('chatHistoryOpen');

  // Update thread ID (updates URL)
  const handleThreadSelect = (id: string) => {
    setThreadId(id);
  };

  // Toggle sidebar (updates URL)
  const handleToggleSidebar = () => {
    setChatHistoryOpen(!chatHistoryOpen);
  };

  return (
    <div>
      <button onClick={handleToggleSidebar}>
        {chatHistoryOpen ? 'Hide' : 'Show'} Sidebar
      </button>

      {threadId ? (
        <ThreadView threadId={threadId} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
```

### Example 3: Workflow Initialization Flow

```typescript
// /home/user/tiler2-ui/src/app/page.tsx
function ThreadWithWorkflowHandler(): React.ReactNode {
  const [searchParams] = useSearchParams();
  const stream = useStreamContext();
  const workflowId = searchParams.get('workflow');
  const [threadId, setThreadId] = useSearchParamState('threadId');
  const updateSearchParams = useSearchParamsUpdate();
  const { addOptimisticThread } = useThreads();

  useEffect(() => {
    const submitWorkflow = async () => {
      if (workflowId && !submittedWorkflowRef.current) {
        submittedWorkflowRef.current = workflowId;

        // Clear existing thread
        if (threadId) {
          setThreadId(null);
        }

        // Create optimistic thread
        const optimisticThreadId = crypto.randomUUID();
        const optimisticThread = buildOptimisticThread({
          threadId: optimisticThreadId,
          threadName: generateThreadName({ workflowTitle: 'Workflow' }),
          userEmail: user.email,
        });
        addOptimisticThread(optimisticThread);

        // Submit to stream
        stream.submit(
          { messages: [] },
          {
            threadId: optimisticThreadId,
            config: {
              configurable: { workflow_id: workflowId },
            },
          },
        );
      }
    };

    submitWorkflow();
  }, [workflowId, threadId, stream, user, addOptimisticThread, setThreadId]);

  // Clear workflow parameter when thread is created
  useEffect(() => {
    if (threadId && workflowId) {
      updateSearchParams({ workflow: undefined });
    }
  }, [threadId, workflowId, updateSearchParams]);

  return <Thread />;
}
```

### Example 4: Protected Route with Auth

```typescript
function App() {
  return (
    <Routes>
      {/* Protected home page */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ThreadsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected workflows page */}
      <Route
        path="/workflows"
        element={
          <ProtectedRoute>
            <AppLayout>
              <WorkflowsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Public callback page */}
      <Route
        path="/auth/callback"
        element={<CallbackPage />}
      />
    </Routes>
  );
}
```

### Example 5: External Navigation

```typescript
// /home/user/tiler2-ui/src/core/services/navigation.ts
export function navigateExternal(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Usage
function SourceLink({ url }: { url: string }) {
  return (
    <button onClick={() => navigateExternal(url)}>
      Open in new tab
    </button>
  );
}
```

## Best Practices

### 1. Use Route Constants

```typescript
// ✅ GOOD: Use constants
import { ROUTES } from '@/core/routing';
navigate(ROUTES.WORKFLOWS);

// ❌ BAD: Hardcoded strings
navigate('/workflows');
```

### 2. Use Navigation Service

```typescript
// ✅ GOOD: Use navigation service
const { navigationService } = useUIContext();
navigationService.navigateToWorkflows();

// ❌ BAD: Direct navigate with manual URL building
const navigate = useNavigate();
navigate('/workflows?chatHistoryOpen=true');
```

### 3. URL State for Shareable State

```typescript
// ✅ GOOD: URL state for shareable state
const [threadId] = useSearchParamState('threadId');

// ❌ BAD: Local state for shareable state
const [threadId, setThreadId] = useState('');
```

### 4. Replace Instead of Push

```typescript
// ✅ GOOD: Replace for parameter updates (no back button spam)
setSearchParams(params, { replace: true });

// ❌ BAD: Push creates history entries
setSearchParams(params, { replace: false });
```

### 5. Preserve Unrelated Parameters

```typescript
// ✅ GOOD: Merge with existing parameters
const merged = mergeSearchParams(current, { threadId: 'abc' });

// ❌ BAD: Replace all parameters
const params = new URLSearchParams({ threadId: 'abc' });
```

### 6. Type-Safe Parameter Access

```typescript
// ✅ GOOD: Type-safe hook
const [threadId] = useSearchParamState('threadId');  // string | null

// ❌ BAD: Manual parsing
const threadId = searchParams.get('threadId');  // string | null, but no validation
```

### 7. Clear Parameters When Needed

```typescript
// ✅ GOOD: Clear parameter with null
setThreadId(null);  // Removes from URL

// ❌ BAD: Set to empty string
setThreadId('');  // Adds "?threadId=" to URL
```

### 8. Handle Missing Parameters

```typescript
// ✅ GOOD: Check for null/undefined
const [threadId] = useSearchParamState('threadId');

if (threadId) {
  fetchThread(threadId);
} else {
  showEmptyState();
}

// ❌ BAD: Assume parameter exists
fetchThread(threadId);  // Error if null!
```

### 9. Use Protected Routes Consistently

```typescript
// ✅ GOOD: Wrap all authenticated pages
<Route
  path="/"
  element={
    <ProtectedRoute>
      <Page />
    </ProtectedRoute>
  }
/>

// ❌ BAD: Conditional rendering inside component
function Page() {
  const { isAuthenticated } = useAuth0();
  if (!isAuthenticated) return <Login />;
  // ...
}
```

### 10. Preserve returnTo on Login

```typescript
// ✅ GOOD: Preserve destination
loginWithRedirect({
  appState: { returnTo: window.location.pathname },
});

// ❌ BAD: Always redirect to home
loginWithRedirect();
```

---

**Previous**: [06-state-management.md](./06-state-management.md) - State management patterns and best practices.

**Documentation Index**: [01-quick-start.md](./01-quick-start.md)
