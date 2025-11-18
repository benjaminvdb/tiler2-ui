# State Management

This document provides comprehensive documentation of state management patterns, best practices, and anti-patterns in the Tiler2 UI application.

## Table of Contents

- [State Architecture Overview](#state-architecture-overview)
- [URL State (Primary)](#url-state-primary)
- [React Context Providers](#react-context-providers)
- [Local Component State](#local-component-state)
- [Local Storage](#local-storage)
- [State Synchronization](#state-synchronization)
- [Optimistic Updates](#optimistic-updates)
- [Error State Handling](#error-state-handling)
- [When to Use Each Approach](#when-to-use-each-approach)
- [Code Examples](#code-examples)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## State Architecture Overview

The application uses a **layered state management approach** with clear priorities:

```
┌─────────────────────────────────────────────────────────┐
│  1. URL State (React Router)        [PRIMARY SOURCE]    │
│     - threadId, chatHistoryOpen, workflow, hideToolCalls │
│     - Browser history, deep linking, shareability        │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  2. React Context Providers          [CROSS-CUTTING]    │
│     - StreamProvider (streaming state)                   │
│     - ThreadProvider (thread CRUD)                       │
│     - UIProvider (UI preferences)                        │
│     - ArtifactProvider (artifact display)                │
│     - HotkeysProvider (keyboard shortcuts)               │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  3. Local Component State            [COMPONENT-SCOPED] │
│     - Form inputs, loading flags, UI toggles             │
│     - Temporary state, animations, effects               │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  4. Local Storage                    [PERSISTENT]       │
│     - sidePanelWidth, user preferences                   │
│     - Auth0 tokens (managed by SDK)                      │
└─────────────────────────────────────────────────────────┘
```

**WHY this hierarchy:**
- **URL state first**: Enables sharing, deep linking, browser history
- **Context for cross-cutting concerns**: Avoid prop drilling
- **Local state for transient UI**: Performance and simplicity
- **Local storage for persistence**: Survive page refresh

## URL State (Primary)

URL search parameters are the **primary source of truth** for application state.

### Implementation

```typescript
// /home/user/tiler2-ui/src/core/routing/search-params.ts
export const SearchParamsSchema = z.object({
  threadId: z.string().optional(),              // Current conversation
  chatHistoryOpen: z.coerce.boolean().optional(), // Sidebar state
  hideToolCalls: z.coerce.boolean().optional(),   // Display preference
  workflow: z.string().optional(),                // Workflow initialization
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;
```

### Usage with `useSearchParamState`

```typescript
// /home/user/tiler2-ui/src/app/app-providers.tsx
const [threadId, setThreadId] = useSearchParamState('threadId');
const [chatHistoryOpen, setChatHistoryOpen] = useSearchParamState('chatHistoryOpen');

// Update URL parameter (replaces history entry)
setThreadId('new-thread-id');  // URL becomes: /?threadId=new-thread-id

// Remove URL parameter
setThreadId(null);              // URL becomes: /
```

### How `useSearchParamState` Works

```typescript
// /home/user/tiler2-ui/src/core/routing/hooks/use-search-params-state.ts
export function useSearchParamState<K extends SearchParamKey>(
  key: K,
): [
  Exclude<SearchParams[K], undefined> | null,
  (value: Exclude<SearchParams[K], undefined> | null) => void,
] {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get current value from URL
  const value = searchParams.get(key);

  // Update URL parameter
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
        { replace: true },  // Replace history entry (no back button spam)
      );
    },
    [key, setSearchParams],
  );

  return [parseSearchParamValue(key, value), setValue];
}
```

### Updating Multiple Parameters

```typescript
// Use useSearchParamsUpdate for bulk updates
const updateParams = useSearchParamsUpdate();

// Update multiple parameters atomically
updateParams({
  threadId: 'abc123',
  chatHistoryOpen: true,
  hideToolCalls: false,
});

// Clear workflow parameter
updateParams({ workflow: undefined });
```

### URL State Examples

```
# New conversation
https://app.com/

# Specific conversation
https://app.com/?threadId=abc123

# Conversation with sidebar open
https://app.com/?threadId=abc123&chatHistoryOpen=true

# Workflow initialization
https://app.com/?workflow=onboarding-workflow

# Workflows page
https://app.com/workflows
```

**WHY URL state:**
- **Shareable**: Users can share exact application state
- **Deep linking**: Direct navigation to specific states
- **Browser history**: Back/forward buttons work naturally
- **Persistence**: State survives page refresh
- **Simple**: No complex state synchronization

**Trade-offs:**
- **Limited data types**: Strings, numbers, booleans only
- **URL length**: Complex state can make long URLs
- **Security**: Sensitive data shouldn't be in URL

## React Context Providers

Context providers manage **cross-cutting concerns** used by multiple components.

### Provider Hierarchy

```typescript
// /home/user/tiler2-ui/src/app/app-providers.tsx
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      <Toaster />
      <UIProvider value={uiContextValue}>
        <HotkeysProvider>
          <ThreadProvider>
            <StreamProvider>
              {children}
            </StreamProvider>
          </ThreadProvider>
        </HotkeysProvider>
      </UIProvider>
    </>
  );
}
```

**Provider order matters:**
- Outer providers are available to inner providers
- Inner providers can consume outer contexts
- StreamProvider is innermost (depends on all others)

### 1. UIProvider - UI Preferences

Manages UI-specific state (sidebar, panel width, navigation):

```typescript
// /home/user/tiler2-ui/src/features/chat/providers/ui-provider.tsx
interface UIContextType {
  chatHistoryOpen: boolean;           // Sidebar open/closed
  isLargeScreen: boolean;             // Desktop vs mobile
  sidePanelWidth: number;             // Panel width in pixels
  navigationService: NavigationService; // Type-safe navigation
  onToggleChatHistory: () => void;
  onNewThread: () => void;
  onSidePanelWidthChange: (width: number) => void;
}

// Usage
const { chatHistoryOpen, onToggleChatHistory } = useUIContext();
```

**State sources:**
- `chatHistoryOpen`: From URL parameter
- `isLargeScreen`: From `useMediaQuery` hook
- `sidePanelWidth`: From localStorage
- `navigationService`: Created from React Router's `navigate`

**WHY UIProvider:**
- **Centralized UI state**: One place for UI preferences
- **Avoids prop drilling**: Deeply nested components can access
- **Type safety**: TypeScript enforces correct usage

### 2. ThreadProvider - Thread CRUD

Manages thread list and CRUD operations:

```typescript
// /home/user/tiler2-ui/src/features/thread/providers/thread-provider.tsx
interface ThreadContextType {
  threads: Thread[];                  // Thread list
  threadsLoading: boolean;            // Loading state
  getThreads: () => Promise<Thread[]>; // Fetch threads
  deleteThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, newName: string) => Promise<void>;
  addOptimisticThread: (thread: Thread) => void;
  removeOptimisticThread: (threadId: string) => void;
  updateThreadInList: (threadId: string, updates: Partial<Thread>) => void;
}

// Usage
const { threads, deleteThread, renameThread } = useThreads();
```

**Responsibilities:**
- Fetch thread list from API
- Optimistic updates for thread creation
- Thread deletion and renaming
- Thread list state management

**WHY ThreadProvider:**
- **Shared state**: Thread list used by sidebar and multiple components
- **Optimistic updates**: Instant UI feedback
- **Centralized API calls**: One place for thread operations

### 3. StreamProvider - LangGraph Streaming

Manages streaming communication with LangGraph API:

```typescript
// /home/user/tiler2-ui/src/core/providers/stream/stream-context.ts
interface StreamContextType {
  // Core streaming
  submit: (input: GraphInput, options?: SubmitOptions) => void;
  interrupt: (input: InterruptInput) => void;
  next: (input?: NextInput) => void;

  // State
  state: GraphState | null;
  history: GraphState[];
  isLoading: boolean;

  // Metadata
  threadId: string | null;
  currentRunId: string | null;

  // Error handling
  error: Error | null;
  clearError: () => void;
  retryStream: () => Promise<void>;
}

// Usage
const stream = useStreamContext();
stream.submit({ messages: [{ role: 'user', content: 'Hello' }] });
```

**Key features:**
- **Token management**: Automatically includes Auth0 token
- **Event handling**: Custom event handlers for metadata, errors
- **Thread creation**: Automatically updates URL with new threadId
- **Error recovery**: Retry logic with token refresh

**WHY StreamProvider:**
- **Complex state**: Streaming requires coordination of multiple states
- **Token injection**: Auth token added to all requests
- **Event handling**: Centralized handling of SSE events
- **Error recovery**: Automatic retry with token refresh

### 4. ArtifactProvider - Artifact Display

Manages artifact display in side panel:

```typescript
// /home/user/tiler2-ui/src/features/artifacts/components/context.ts
interface ArtifactContextType {
  currentArtifact: Artifact | null;
  openArtifact: (artifact: Artifact) => void;
  closeArtifact: () => void;
  isOpen: boolean;
}

// Usage
const { openArtifact, closeArtifact, currentArtifact } = useArtifactContext();
```

**WHY ArtifactProvider:**
- **Shared state**: Artifact can be opened from multiple places
- **Simple API**: Easy to open/close artifacts
- **Isolation**: Artifact state separate from thread state

### 5. HotkeysProvider - Keyboard Shortcuts

Manages global keyboard shortcuts:

```typescript
// /home/user/tiler2-ui/src/features/hotkeys/hotkeys-provider.tsx
const HotkeysProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Register global hotkeys
  useHotkeys('mod+k', () => { /* Open command palette */ });
  useHotkeys('mod+n', () => { /* New thread */ });
  useHotkeys('mod+/', () => { /* Toggle sidebar */ });

  return <>{children}</>;
};
```

**WHY HotkeysProvider:**
- **Global shortcuts**: Available throughout app
- **Centralized**: All shortcuts defined in one place
- **Conditional**: Can disable based on context

## Local Component State

Local state with `useState` for **component-scoped** temporary state.

### When to Use Local State

```typescript
// ✅ GOOD: Transient UI state
function RenameDialog() {
  const [name, setName] = useState('');  // Form input
  const [loading, setLoading] = useState(false);  // Loading flag
  const [error, setError] = useState<string | null>(null);  // Error message

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await renameThread(threadId, name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
}

// ✅ GOOD: Animation state
function Message() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);  // Trigger enter animation
  }, []);
}

// ✅ GOOD: Dropdown state
function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      {/* ... */}
    </DropdownMenu>
  );
}
```

### When NOT to Use Local State

```typescript
// ❌ BAD: Shared state across components
function ComponentA() {
  const [threadId, setThreadId] = useState('');  // Should be URL state
}

function ComponentB() {
  const [threadId, setThreadId] = useState('');  // Duplicate state!
}

// ✅ GOOD: Use URL state instead
function ComponentA() {
  const [threadId] = useSearchParamState('threadId');
}

function ComponentB() {
  const [threadId] = useSearchParamState('threadId');
}
```

**WHY local state:**
- **Performance**: No unnecessary re-renders
- **Simplicity**: No context or URL setup needed
- **Isolation**: State changes don't affect other components

## Local Storage

Persistent storage for **user preferences** that survive page refresh.

### Current Usage

```typescript
// /home/user/tiler2-ui/src/app/app-providers.tsx
const [sidePanelWidth, setSidePanelWidth] = useState(350);

// Load from localStorage on mount
useEffect(() => {
  const savedWidth = localStorage.getItem('sidePanelWidth');
  if (savedWidth) {
    const width = parseInt(savedWidth, 10);
    if (width >= SIDE_PANEL_MIN_WIDTH && width <= SIDE_PANEL_MAX_WIDTH) {
      setSidePanelWidth(width);
    }
  }
}, []);

// Save to localStorage on change
const handleSidePanelWidthChange = useCallback((width: number) => {
  const constrainedWidth = Math.min(
    Math.max(width, SIDE_PANEL_MIN_WIDTH),
    SIDE_PANEL_MAX_WIDTH,
  );
  setSidePanelWidth(constrainedWidth);
  localStorage.setItem('sidePanelWidth', constrainedWidth.toString());
}, []);
```

### Auth0 Token Storage

Auth0 SDK automatically manages token storage:

```typescript
// /home/user/tiler2-ui/src/main.tsx
<Auth0Provider
  domain={env.AUTH0_DOMAIN}
  clientId={env.AUTH0_CLIENT_ID}
  useRefreshTokens={true}
  cacheLocation="localstorage"  // Auth0 manages tokens in localStorage
>
```

**WHY localStorage:**
- **Persistence**: Survives page refresh and browser restart
- **Simplicity**: Built-in browser API
- **Synchronous**: No async complexity

**Trade-offs:**
- **Size limit**: 5-10MB per domain
- **No expiration**: Must manually clean up
- **Security**: Accessible to any script (use for non-sensitive data)

## State Synchronization

### URL State → React State

URL parameters automatically sync to React state:

```typescript
// URL changes trigger re-render
const [threadId] = useSearchParamState('threadId');

useEffect(() => {
  if (threadId) {
    // Fetch thread data when threadId changes
    fetchThreadData(threadId);
  }
}, [threadId]);
```

### React State → URL State

Updating state updates URL:

```typescript
const [threadId, setThreadId] = useSearchParamState('threadId');

// This updates both React state AND URL
setThreadId('new-thread-id');
// URL becomes: /?threadId=new-thread-id
```

### Preventing Sync Loops

```typescript
// ✅ GOOD: Use dependencies correctly
useEffect(() => {
  if (threadId) {
    fetchThreadData(threadId);
  }
}, [threadId]);  // Only re-run when threadId changes

// ❌ BAD: Missing dependency causes stale closure
useEffect(() => {
  if (threadId) {
    fetchThreadData(threadId);  // Uses old threadId
  }
}, []);  // Missing threadId dependency
```

### StreamProvider Sync Example

```typescript
// /home/user/tiler2-ui/src/core/providers/stream/stream-session.tsx
const [threadId, setThreadId] = useSearchParamState('threadId');

const streamConfig = useMemo(() => ({
  apiUrl,
  assistantId,
  threadId: threadId ?? null,  // Sync URL state to stream config
  // ...
}), [apiUrl, assistantId, threadId]);

// When thread is created, update URL
const onThreadId = (id: string) => {
  setThreadId(id);  // Updates URL, which triggers streamConfig update
};
```

## Optimistic Updates

**Optimistic updates** provide instant UI feedback by updating local state before server confirmation.

### Thread Creation

```typescript
// /home/user/tiler2-ui/src/app/page.tsx
const { addOptimisticThread, removeOptimisticThread } = useThreads();

const optimisticThreadId = crypto.randomUUID();
const threadName = generateThreadName({ workflowTitle: workflow.title });

// 1. Create optimistic thread
const optimisticThread = buildOptimisticThread({
  threadId: optimisticThreadId,
  threadName,
  userEmail: user.email,
});

// 2. Add to UI immediately
addOptimisticThread(optimisticThread);

// 3. Submit to backend
stream.submit(
  { messages: [] },
  {
    threadId: optimisticThreadId,
    metadata: { name: threadName },
  },
);

// 4. Verify creation after delay
try {
  await sleep(500);
  const threads = await getThreads();
  setThreads(threads);  // Replace optimistic with real thread
} catch (error) {
  removeOptimisticThread(optimisticThreadId);  // Rollback on error
  toast.error('Failed to create conversation');
}
```

### Thread Rename

```typescript
// /home/user/tiler2-ui/src/features/thread/providers/thread-provider.tsx
const renameThread = async (threadId: string, newName: string) => {
  const previousThreads = threads;  // Save for rollback

  try {
    // 1. Update UI optimistically
    setThreads((prev) =>
      prev.map((t) =>
        t.thread_id === threadId
          ? { ...t, metadata: { ...t.metadata, name: newName } }
          : t,
      ),
    );

    // 2. Send to backend
    const response = await fetch(`${apiUrl}/threads/${threadId}`, {
      method: 'PATCH',
      body: JSON.stringify({ metadata: { name: newName } }),
    });

    if (!response.ok) throw new Error('Failed to rename');

    // 3. Update with server response
    const updatedThread = await response.json();
    setThreads((prev) =>
      prev.map((t) => (t.thread_id === threadId ? updatedThread : t)),
    );
  } catch (error) {
    // 4. Rollback on error
    setThreads(previousThreads);
    throw error;
  }
};
```

**WHY optimistic updates:**
- **Instant feedback**: No waiting for server
- **Better UX**: App feels responsive
- **Offline support**: Can queue operations

**Trade-offs:**
- **Complexity**: Rollback logic required
- **Inconsistency**: UI may show wrong state temporarily
- **Conflicts**: Multiple clients can cause conflicts

## Error State Handling

### Component-Level Error State

```typescript
function RenameDialog() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);  // Clear previous error

    try {
      await renameThread(threadId, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <>
      {error && (
        <div className="text-destructive text-sm">{error}</div>
      )}
      {/* Form */}
    </>
  );
}
```

### Context-Level Error State

```typescript
// /home/user/tiler2-ui/src/core/providers/stream/stream-session.tsx
const [streamError, setStreamError] = useState<Error | null>(null);

const clearError = useCallback(() => {
  setStreamError(null);
}, []);

const retryStream = useCallback(async () => {
  setStreamError(null);
  setAccessToken(null);  // Force token refresh
}, []);

// Provide to children
const extendedStreamValue = useMemo(() => ({
  ...streamValue,
  error: streamError,
  clearError,
  retryStream,
}), [streamValue, streamError, clearError, retryStream]);
```

### Error Boundary Pattern

```typescript
// /home/user/tiler2-ui/src/shared/components/error-boundary/global-error-boundary.tsx
class GlobalErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

**WHY multiple error strategies:**
- **Graceful degradation**: Errors don't crash entire app
- **User feedback**: Clear error messages
- **Observability**: Errors tracked in Sentry
- **Recovery**: Retry mechanisms where appropriate

## When to Use Each Approach

### Decision Tree

```
Need to share state with URL (deep linking)?
  └─ YES → Use URL state (useSearchParamState)
  └─ NO  → Continue

Need to share across multiple unrelated components?
  └─ YES → Use React Context
  └─ NO  → Continue

Need to persist across page refresh?
  └─ YES → Use localStorage
  └─ NO  → Use local component state (useState)
```

### Examples by Use Case

| Use Case | Solution | WHY |
|----------|----------|-----|
| Current thread ID | URL state | Deep linking, browser history |
| Sidebar open/closed | URL state | Shareable, survives refresh |
| Thread list | Context (ThreadProvider) | Shared across sidebar and page |
| Streaming state | Context (StreamProvider) | Complex, shared, stateful |
| Form input value | Local state | Temporary, component-scoped |
| Loading spinner | Local state | Temporary, component-scoped |
| Dropdown open/closed | Local state | Temporary, component-scoped |
| Panel width | localStorage | Preference, survives refresh |
| Auth token | localStorage (Auth0 SDK) | Persistence, security |
| Error message | Local state or Context | Depends on scope |

## Code Examples

### Example 1: Complete State Management in a Feature

```typescript
// Thread rename flow using multiple state layers

// 1. URL state for thread ID
const [threadId] = useSearchParamState('threadId');

// 2. Context for thread operations
const { renameThread, threads } = useThreads();

// 3. Local state for dialog UI
function RenameDialog({ open, onClose }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!threadId) return;

    setLoading(true);
    setError(null);

    try {
      // Uses context provider which does optimistic update
      await renameThread(threadId, name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

### Example 2: Workflow Initialization

```typescript
// /home/user/tiler2-ui/src/app/page.tsx

// 1. Read workflow from URL
const [searchParams] = useSearchParams();
const workflowId = searchParams.get('workflow');

// 2. Get thread ID from URL
const [threadId, setThreadId] = useSearchParamState('threadId');

// 3. Use context for optimistic updates
const { addOptimisticThread } = useThreads();

// 4. Use context for streaming
const stream = useStreamContext();

// 5. Local state for submission tracking
const [isSubmittingWorkflow, setIsSubmittingWorkflow] = useState(false);
const submittedWorkflowRef = useRef<string | null>(null);

useEffect(() => {
  const submitWorkflow = async () => {
    if (workflowId && submittedWorkflowRef.current !== workflowId) {
      setIsSubmittingWorkflow(true);

      // Clear existing thread (URL state)
      if (threadId) {
        setThreadId(null);
      }

      // Create optimistic thread (context state)
      const optimisticThreadId = crypto.randomUUID();
      const optimisticThread = buildOptimisticThread({
        threadId: optimisticThreadId,
        threadName: generateThreadName({ workflowTitle: 'Workflow' }),
        userEmail: user.email,
      });
      addOptimisticThread(optimisticThread);

      // Submit to stream (context state)
      stream.submit(
        { messages: [] },
        {
          threadId: optimisticThreadId,
          config: { configurable: { workflow_id: workflowId } },
        },
      );

      submittedWorkflowRef.current = workflowId;
      setIsSubmittingWorkflow(false);
    }
  };

  submitWorkflow();
}, [workflowId, threadId, stream, user, addOptimisticThread, setThreadId]);
```

### Example 3: Panel Resize with Persistence

```typescript
// /home/user/tiler2-ui/src/app/app-providers.tsx

// 1. Local state for current width
const [sidePanelWidth, setSidePanelWidth] = useState(350);

// 2. Load from localStorage on mount
useEffect(() => {
  const savedWidth = localStorage.getItem('sidePanelWidth');
  if (savedWidth) {
    const width = parseInt(savedWidth, 10);
    if (width >= SIDE_PANEL_MIN_WIDTH && width <= SIDE_PANEL_MAX_WIDTH) {
      setSidePanelWidth(width);
    }
  }
}, []);

// 3. Save to localStorage on change
const handleSidePanelWidthChange = useCallback((width: number) => {
  const constrainedWidth = Math.min(
    Math.max(width, SIDE_PANEL_MIN_WIDTH),
    SIDE_PANEL_MAX_WIDTH,
  );
  setSidePanelWidth(constrainedWidth);
  localStorage.setItem('sidePanelWidth', constrainedWidth.toString());
}, []);

// 4. Provide via context
const uiContextValue = useMemo(() => ({
  sidePanelWidth,
  onSidePanelWidthChange: handleSidePanelWidthChange,
  // ...
}), [sidePanelWidth, handleSidePanelWidthChange]);
```

## Anti-Patterns to Avoid

### 1. Prop Drilling

```typescript
// ❌ BAD: Passing props through many levels
function App() {
  const [threadId, setThreadId] = useState('');
  return <Layout threadId={threadId} setThreadId={setThreadId} />;
}

function Layout({ threadId, setThreadId }) {
  return <Sidebar threadId={threadId} setThreadId={setThreadId} />;
}

function Sidebar({ threadId, setThreadId }) {
  return <ThreadList threadId={threadId} setThreadId={setThreadId} />;
}

// ✅ GOOD: Use URL state or context
function App() {
  const [threadId, setThreadId] = useSearchParamState('threadId');
  return <Layout />;
}

function ThreadList() {
  const [threadId, setThreadId] = useSearchParamState('threadId');
  // Direct access, no prop drilling
}
```

### 2. Excessive Context

```typescript
// ❌ BAD: One massive context for everything
interface AppContextType {
  threadId: string;
  threads: Thread[];
  user: User;
  sidebarOpen: boolean;
  theme: string;
  language: string;
  // ... 20+ more fields
}

// ✅ GOOD: Multiple focused contexts
<UIProvider>
  <ThreadProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </ThreadProvider>
</UIProvider>
```

### 3. Duplicated State

```typescript
// ❌ BAD: Same state in multiple places
function ComponentA() {
  const [threadId, setThreadId] = useState('');
}

function ComponentB() {
  const [threadId, setThreadId] = useState('');  // Duplicate!
}

// ✅ GOOD: Single source of truth
function ComponentA() {
  const [threadId] = useSearchParamState('threadId');
}

function ComponentB() {
  const [threadId] = useSearchParamState('threadId');  // Same source
}
```

### 4. State in Wrong Layer

```typescript
// ❌ BAD: Shared state in local component
function Sidebar() {
  const [currentThreadId, setCurrentThreadId] = useState('');
  // Other components can't access this!
}

// ✅ GOOD: Shared state in URL or context
function Sidebar() {
  const [currentThreadId] = useSearchParamState('threadId');
  // All components can access via same hook
}
```

### 5. Missing Dependencies

```typescript
// ❌ BAD: Stale closure
const [count, setCount] = useState(0);

useEffect(() => {
  const timer = setInterval(() => {
    console.log(count);  // Always logs 0!
  }, 1000);
  return () => clearInterval(timer);
}, []);  // Missing 'count' dependency

// ✅ GOOD: Include all dependencies
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count);  // Logs current value
  }, 1000);
  return () => clearInterval(timer);
}, [count]);  // Includes dependency
```

### 6. Uncontrolled State Updates

```typescript
// ❌ BAD: Direct mutation
const [threads, setThreads] = useState<Thread[]>([]);

function addThread(thread: Thread) {
  threads.push(thread);  // Mutation!
  setThreads(threads);   // React won't detect change
}

// ✅ GOOD: Immutable updates
function addThread(thread: Thread) {
  setThreads((prev) => [...prev, thread]);  // New array
}
```

### 7. Forgetting Optimistic Rollback

```typescript
// ❌ BAD: No rollback on error
const optimisticUpdate = async () => {
  setThreads((prev) => [...prev, newThread]);
  await saveThread(newThread);
  // What if saveThread fails? Thread stays in UI!
};

// ✅ GOOD: Rollback on error
const optimisticUpdate = async () => {
  const previousThreads = threads;

  try {
    setThreads((prev) => [...prev, newThread]);
    await saveThread(newThread);
  } catch (error) {
    setThreads(previousThreads);  // Rollback
    toast.error('Failed to save thread');
  }
};
```

### 8. Synchronous localStorage in Render

```typescript
// ❌ BAD: Reading localStorage during render
function Component() {
  const savedValue = localStorage.getItem('key');  // Blocking!
  return <div>{savedValue}</div>;
}

// ✅ GOOD: Read in useEffect
function Component() {
  const [value, setValue] = useState('');

  useEffect(() => {
    const savedValue = localStorage.getItem('key');
    if (savedValue) setValue(savedValue);
  }, []);

  return <div>{value}</div>;
}
```

---

**Next**: [07-routing.md](./07-routing.md) - Routing and navigation patterns with React Router v7.
