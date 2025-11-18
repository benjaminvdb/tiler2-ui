# Thread Management

Thread management provides CRUD operations for conversation threads, including creation, renaming, deletion, and listing. The system uses optimistic updates for responsive UI and syncs with the LangGraph backend.

## Why This Exists

Threads represent individual conversations with the AI. Users need to manage multiple conversations over time, switch between them, and organize their chat history. The thread system provides persistent storage of conversation state and metadata through the LangGraph API.

## Thread Data Structure

Threads follow the LangGraph SDK structure.

**Type Definition:**
```typescript
interface Thread {
  thread_id: string;
  created_at: string;
  updated_at: string;
  metadata: {
    name?: string;
    owner?: string;
    assistant_id?: string;
    workflow_id?: string;
    [key: string]: unknown;
  };
  status: "idle" | "busy" | "interrupted";
  values: {
    messages?: Message[];
    [key: string]: unknown;
  };
  interrupts?: Record<string, unknown>;
}
```

**Key Fields:**
- `thread_id` - Unique identifier (UUID)
- `metadata.name` - Display name shown in sidebar
- `metadata.owner` - User email who created thread
- `metadata.assistant_id` - Assistant/graph ID
- `metadata.workflow_id` - Selected workflow (optional)
- `values.messages` - Conversation messages
- `status` - Current thread state
- `interrupts` - Active workflow interrupts

## ThreadProvider Implementation

The ThreadProvider manages thread state and API operations.

**File:** `/home/user/tiler2-ui/src/features/thread/providers/thread-provider.tsx`
```typescript
interface ThreadContextType {
  getThreads: () => Promise<Thread[]>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<Thread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
  deleteThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, newName: string) => Promise<void>;
  addOptimisticThread: (thread: Thread) => void;
  removeOptimisticThread: (threadId: string) => void;
  updateThreadInList: (threadId: string, updates: Partial<Thread>) => void;
}

export const ThreadProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const config = getClientConfig();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const fetchWithAuth = useAuthenticatedFetch();

  // Implementation...

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
};
```

**Usage:**
```typescript
const {
  threads,
  threadsLoading,
  deleteThread,
  renameThread,
  addOptimisticThread
} = useThreads();
```

## Creating New Threads

### Optimistic Thread Creation

New threads are created optimistically for immediate UI feedback.

**File:** `/home/user/tiler2-ui/src/features/thread/utils/build-optimistic-thread.ts`
```typescript
interface OptimisticThreadOptions {
  threadId: string;        // crypto.randomUUID()
  threadName: string;      // Workflow title or truncated message
  userEmail: string;       // Current user's email
  firstMessage?: Message;  // Optional first message
}

export function buildOptimisticThread(
  options: OptimisticThreadOptions,
): Thread {
  const now = new Date().toISOString();
  const assistantId = getClientConfig().assistantId;

  const thread: Thread = {
    thread_id: options.threadId,
    created_at: now,
    updated_at: now,
    metadata: {
      name: options.threadName,
      owner: options.userEmail,
      ...(assistantId && { assistant_id: assistantId }),
    },
    status: "idle",
    values: options.firstMessage
      ? { messages: [options.firstMessage] }
      : {},
    interrupts: {},
  };

  return thread;
}
```

**Flow:**
1. User starts new conversation or selects workflow
2. Generate UUID for thread_id
3. Build optimistic thread object
4. Add to threads list via `addOptimisticThread()`
5. Navigate to new thread
6. Backend confirms creation via SSE stream
7. Update thread with server response

**Example:**
```typescript
const newThreadId = crypto.randomUUID();
const optimisticThread = buildOptimisticThread({
  threadId: newThreadId,
  threadName: "Climate Risk Assessment",
  userEmail: user.email,
});

addOptimisticThread(optimisticThread);
navigate(`/?thread_id=${newThreadId}`);
```

### Thread Name Generation

Thread names are auto-generated from the first message.

**File:** `/home/user/tiler2-ui/src/features/thread/utils/generate-thread-name.ts`

**Logic:**
1. Take first user message content
2. Truncate to ~50 characters
3. Break at word boundary
4. Add ellipsis if truncated

**Example:**
```typescript
// Input: "I need help creating a sustainability report for my company..."
// Output: "I need help creating a sustainability report..."
```

## Renaming Threads

Users can rename threads from the sidebar.

**Implementation:**
```typescript
const renameThread = useCallback(
  async (threadId: string, newName: string): Promise<void> => {
    const trimmedName = newName.trim();
    if (trimmedName === "") {
      throw new Error("Thread name cannot be empty");
    }

    const previousThreads = threads;

    try {
      // Optimistic update
      setThreads((prev) =>
        prev.map((t) =>
          t.thread_id === threadId
            ? {
                ...t,
                metadata: { ...t.metadata, name: trimmedName },
              }
            : t,
        ),
      );

      // API call
      const response = await fetchWithAuth(`${apiUrl}/threads/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: { name: trimmedName },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to rename thread: ${response.status}`);
      }

      const updatedThread: Thread = await response.json();
      setThreads((prev) =>
        prev.map((t) => (t.thread_id === threadId ? updatedThread : t)),
      );
    } catch (error) {
      // Rollback on error
      setThreads(previousThreads);
      reportThreadError(error as Error, {
        operation: "renameThread",
        threadId,
      });
      throw error;
    }
  },
  [apiUrl, threads, fetchWithAuth],
);
```

**Flow:**
1. User clicks rename icon in sidebar
2. Dialog opens with current name
3. User enters new name
4. Optimistic UI update (immediate)
5. PATCH request to `/threads/{id}`
6. On success: confirm with server response
7. On error: rollback to previous name

**UI Component:** `/home/user/tiler2-ui/src/features/side-panel/components/dialogs/rename-thread-dialog.tsx`

## Deleting Threads

Users can delete threads from the sidebar.

**Implementation:**
```typescript
const deleteThread = useCallback(
  async (threadId: string): Promise<void> => {
    try {
      const response = await fetchWithAuth(`${apiUrl}/threads/${threadId}`, {
        method: "DELETE",
        timeoutMs: THREAD_DELETE_TIMEOUT_MS,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete thread: ${response.status}`);
      }

      // Remove from local state
      setThreads((prev) => prev.filter((t) => t.thread_id !== threadId));
    } catch (error) {
      reportThreadError(error as Error, {
        operation: "deleteThread",
        threadId,
      });
      throw error;
    }
  },
  [apiUrl, fetchWithAuth],
);
```

**Flow:**
1. User clicks delete icon in sidebar
2. Confirmation dialog appears
3. User confirms deletion
4. DELETE request to `/threads/{id}`
5. Remove from threads list
6. If current thread deleted, navigate to home

**UI Component:** `/home/user/tiler2-ui/src/features/side-panel/components/dialogs/delete-thread-confirm-dialog.tsx`

**Safety:**
- Confirmation dialog prevents accidental deletion
- Server-side validation ensures user owns thread
- No undo functionality (permanent deletion)

## Searching/Listing Threads

### Fetching Threads

Threads are fetched on app load and after certain operations.

**Implementation:**
```typescript
const getThreads = useCallback(async (): Promise<Thread[]> => {
  if (!apiUrl || !assistantId) return [];

  try {
    const response = await fetchWithAuth(`${apiUrl}/threads/search`, {
      method: "POST",
      timeoutMs: THREAD_LIST_TIMEOUT_MS,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata: {
          ...getThreadSearchMetadata(assistantId),
        },
        limit: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const threads = await response.json();
    return threads;
  } catch (error) {
    reportThreadError(error as Error, {
      operation: "searchThreads",
      url: apiUrl,
    });
    return [];
  }
}, [apiUrl, assistantId, fetchWithAuth]);
```

**Search Metadata:**
```typescript
const getThreadSearchMetadata = (
  assistantId: string,
): { graph_id: string } | { assistant_id: string } => {
  if (validate(assistantId)) {
    return { assistant_id: assistantId }; // UUID format
  } else {
    return { graph_id: assistantId };     // Graph name
  }
};
```

**Filtering:**
- Only threads owned by current user
- Filtered by assistant_id/graph_id
- Sorted by updated_at (newest first)
- Limited to 100 most recent

### Thread List UI

Threads display in the sidebar with search and grouping.

**File:** `/home/user/tiler2-ui/src/features/side-panel/components/thread-history/index.tsx`

**Features:**
- Desktop: Collapsible side panel
- Mobile: Bottom sheet drawer
- Search by thread name or message content
- Grouped by date (Today, Yesterday, Last 7 Days, etc.)
- Hover actions (rename, delete)
- Active thread highlighted

**Component:**
```typescript
export const ThreadHistory = (): React.JSX.Element => {
  const {
    isLargeScreen,
    chatHistoryOpen,
    setChatHistoryOpen,
    threads,
    threadsLoading,
  } = useThreadHistory();

  return (
    <>
      <DesktopHistoryPanel
        chatHistoryOpen={chatHistoryOpen}
        setChatHistoryOpen={setChatHistoryOpen}
        threads={threads}
        threadsLoading={threadsLoading}
      />
      <MobileHistorySheet
        chatHistoryOpen={chatHistoryOpen}
        setChatHistoryOpen={setChatHistoryOpen}
        isLargeScreen={isLargeScreen}
        threads={threads}
      />
    </>
  );
};
```

## Thread Metadata

Metadata stores additional information about threads.

### Standard Metadata Fields

**Required:**
- `name` - Display name
- `owner` - User email

**Optional:**
- `assistant_id` - Assistant UUID
- `workflow_id` - Selected workflow
- `workflow_title` - Workflow display name
- Custom fields (extensible)

### Workflow Metadata

When a workflow is selected, metadata is enriched:

```typescript
{
  metadata: {
    name: "Climate Risk Assessment",
    owner: "user@example.com",
    assistant_id: "uuid-here",
    workflow_id: "climate-risk-assessment",
    workflow_title: "Climate Risk Assessment",
    category: "Risk Assessment"
  }
}
```

**Usage:**
- Display workflow icon in thread list
- Filter threads by workflow
- Resume workflow context

## Optimistic Updates for Threads

Optimistic updates provide instant feedback while awaiting server confirmation.

### Pattern

```typescript
// 1. Save previous state
const previousState = currentState;

try {
  // 2. Update UI immediately
  setState(newState);

  // 3. Call API
  const response = await fetch(...);

  // 4. Confirm with server response
  setState(serverState);
} catch (error) {
  // 5. Rollback on error
  setState(previousState);
  showError(error);
}
```

### Use Cases

1. **Adding Thread:**
   - Add to list immediately
   - Remove if creation fails

2. **Renaming Thread:**
   - Show new name immediately
   - Revert if update fails

3. **Deleting Thread:**
   - No optimistic update (safety)
   - Wait for server confirmation

### Helper Methods

**Add Optimistic Thread:**
```typescript
const addOptimisticThread = useCallback((thread: Thread): void => {
  setThreads((prev) => [thread, ...prev]);
}, []);
```

**Remove Optimistic Thread:**
```typescript
const removeOptimisticThread = useCallback((threadId: string): void => {
  setThreads((prev) => prev.filter((t) => t.thread_id !== threadId));
}, []);
```

**Update Thread:**
```typescript
const updateThreadInList = useCallback(
  (threadId: string, updates: Partial<Thread>): void => {
    setThreads((prev) =>
      prev.map((t) => (t.thread_id === threadId ? { ...t, ...updates } : t)),
    );
  },
  [],
);
```

## Thread Text Extraction

For search functionality, text is extracted from thread messages.

**File:** `/home/user/tiler2-ui/src/features/side-panel/components/thread-history/utils/thread-text-extractor.ts`

**Logic:**
1. Extract all human messages
2. Concatenate content
3. Truncate to reasonable length
4. Use for search indexing

**Example:**
```typescript
// Thread with messages:
// Human: "Help me with climate reporting"
// AI: "I can help..."
// Human: "What about TCFD?"

// Extracted text:
// "Help me with climate reporting What about TCFD?"
```

## Best Practices

### 1. Always Use Optimistic Updates

```typescript
// ✅ Good
addOptimisticThread(thread);
navigate(`/?thread_id=${thread.thread_id}`);

// ❌ Bad
await createThread(); // Wait for server
navigate(...);        // Slow user experience
```

### 2. Handle Errors Gracefully

```typescript
try {
  await deleteThread(id);
  toast.success("Thread deleted");
} catch (error) {
  toast.error("Failed to delete thread");
  // Thread remains in list
}
```

### 3. Validate Thread Names

```typescript
const trimmedName = name.trim();
if (!trimmedName) {
  throw new Error("Name cannot be empty");
}
if (trimmedName.length > 100) {
  throw new Error("Name too long");
}
```

### 4. Use Thread ID in URL

```typescript
// ✅ Good - Shareable, bookmarkable
navigate(`/?thread_id=${threadId}`);

// ❌ Bad - Not shareable
setCurrentThread(thread);
```

## Common Patterns

### Loading State

```typescript
{threadsLoading ? (
  <ThreadHistoryLoading />
) : (
  <ThreadList threads={threads} />
)}
```

### Empty State

```typescript
{threads.length === 0 && !threadsLoading && (
  <EmptyState
    title="No conversations yet"
    description="Start a new chat or select a workflow"
  />
)}
```

### Active Thread Highlighting

```typescript
const isActive = thread.thread_id === currentThreadId;

<div className={cn(
  "thread-item",
  isActive && "bg-blue-50 border-blue-200"
)}>
```

## Error Handling

### Network Errors

```typescript
try {
  await getThreads();
} catch (error) {
  if (error instanceof NetworkError) {
    toast.error("Check your internet connection");
  }
}
```

### Permission Errors

```typescript
if (response.status === 403) {
  toast.error("You don't have permission to access this thread");
  navigate("/");
}
```

### Not Found Errors

```typescript
if (response.status === 404) {
  toast.error("Thread not found");
  navigate("/");
}
```

## Performance Considerations

### Pagination

Currently loads 100 most recent threads. For users with more:

```typescript
// Future improvement
const getThreads = async (offset = 0, limit = 100) => {
  // Paginated loading
};
```

### Virtual Scrolling

For large thread lists, implement virtual scrolling:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
```

### Debounced Search

```typescript
const debouncedSearch = useDebounce(searchQuery, 300);
```

## Related Documentation

- [Chat System](/home/user/tiler2-ui/docs/08-chat-system.md) - Message streaming and rendering
- [Workflows](/home/user/tiler2-ui/docs/10-workflows.md) - Workflow selection and metadata
- [State Management](/home/user/tiler2-ui/docs/06-state-management.md) - Global state patterns
- [Routing](/home/user/tiler2-ui/docs/07-routing.md) - URL-based thread navigation

---

**Next:** [Workflows](/home/user/tiler2-ui/docs/10-workflows.md)
