# Thread Schema

This document describes the thread data structure, including metadata, status, and integration with LangGraph workflows.

## Overview

A thread represents a conversation session between the user and the AI assistant. Threads contain messages, metadata, and state information that persists across interactions.

## Thread Data Structure

### Core Thread State

From `/home/user/tiler2-ui/src/shared/types/index.ts`:

```typescript
export interface ThreadState {
  threadId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
```

**Fields:**
- `threadId` - Unique identifier for the thread (null for new threads)
- `messages` - Array of all messages in the conversation
- `isLoading` - Whether the thread is currently processing
- `error` - Error message if the thread encountered an issue

**Why:** This structure maintains UI state and synchronizes with URL search params for browser history support.

### Thread Metadata

```typescript
export interface ThreadMetadata {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}
```

**Fields:**
- `id` - Unique thread identifier (UUID format)
- `title` - Optional human-readable title (derived from first message)
- `createdAt` - ISO 8601 timestamp of thread creation
- `updatedAt` - ISO 8601 timestamp of last update
- `messageCount` - Total number of messages in the thread

**Example:**
```typescript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Weather inquiry",
  createdAt: "2025-01-15T10:30:00Z",
  updatedAt: "2025-01-15T10:35:00Z",
  messageCount: 6
}
```

**Why:** Metadata enables thread listing, search, and management in the UI.

## Thread Lifecycle

### 1. Thread Creation

**New thread (no ID):**
```typescript
const initialState: ThreadState = {
  threadId: null,
  messages: [],
  isLoading: false,
  error: null,
};
```

**Why:** New threads start with null ID. The backend assigns an ID on first message.

### 2. First Message Sent

```typescript
// User sends first message
const state: ThreadState = {
  threadId: null, // Still null
  messages: [
    {
      type: "human",
      content: "What is the weather?",
      id: "msg_temp_123"
    }
  ],
  isLoading: true,
  error: null,
};
```

### 3. Thread ID Assignment

```typescript
// Backend responds with thread ID
const state: ThreadState = {
  threadId: "550e8400-e29b-41d4-a716-446655440000", // ID assigned
  messages: [
    {
      type: "human",
      content: "What is the weather?",
      id: "msg_abc123"
    },
    {
      type: "ai",
      content: "The weather is...",
      id: "msg_def456"
    }
  ],
  isLoading: false,
  error: null,
};
```

**Why:** Thread ID is assigned by the backend to ensure uniqueness and persistence.

### 4. Subsequent Messages

All future messages reference the same `threadId`, building conversation history.

## Thread Status and Values

### Loading States

```typescript
// Before sending message
{ isLoading: false, error: null }

// During API call
{ isLoading: true, error: null }

// After successful response
{ isLoading: false, error: null }

// After error
{ isLoading: false, error: "Failed to connect to API" }
```

**Why:** Loading states control UI feedback (spinners, disabled inputs, etc.).

### Error States

```typescript
export interface ThreadState {
  // ...
  error: string | null;
}

// Common error values:
error: "Network error"
error: "API key invalid"
error: "Thread not found"
error: "Rate limit exceeded"
```

**Why:** Error messages provide user feedback and debugging information.

## Workflow Metadata Integration

Threads integrate with LangGraph workflows through configuration.

### Stream Configuration

From `/home/user/tiler2-ui/src/core/providers/stream/types.ts`:

```typescript
export const useTypedStream = useStream<
  GraphState,
  {
    // ...
    ConfigurableType: {
      workflow_id?: string;
      workflow_type?: string;
    };
  }
>;
```

**Example thread with workflow metadata:**
```typescript
{
  threadId: "thread_123",
  messages: [...],
  config: {
    workflow_id: "customer_support_flow",
    workflow_type: "interrupt_enabled"
  }
}
```

**Why:** Workflow metadata determines behavior:
- Which agent graph to use
- Whether interrupts are enabled
- Custom workflow parameters

### Graph State Integration

```typescript
export type GraphState = {
  messages: Message[];
  ui?: UIMessage[];
  sources?: Source[];
};
```

**Why:** The graph state extends thread state with additional workflow data:
- `ui` - Custom UI messages for rich interactions
- `sources` - Citation sources for response attribution

## Thread Persistence

### URL Integration

Threads synchronize with URL search params:

```typescript
// URL format
https://app.example.com/?threadId=550e8400-e29b-41d4-a716-446655440000

// React Router sync
const [searchParams, setSearchParams] = useSearchParams();
const threadId = searchParams.get("threadId");
```

**Why:** URL-based thread IDs enable:
- Shareable conversation links
- Browser back/forward navigation
- Bookmark support
- Deep linking

### Storage Strategy

Threads are persisted server-side through the LangGraph SDK:
- **Short-term:** In-memory during active session
- **Long-term:** Database storage via LangGraph backend
- **Client-side:** URL params only (no localStorage)

**Why:** Server-side persistence ensures data consistency and enables multi-device access.

## Message Metadata

Individual messages include metadata linking them to threads.

From `/home/user/tiler2-ui/src/shared/types/index.ts`:

```typescript
export interface MessageMetadata {
  id: string;
  timestamp: string;
  threadId?: string;
  parentCheckpoint?: string;
}
```

**Fields:**
- `id` - Unique message identifier
- `timestamp` - ISO 8601 timestamp
- `threadId` - Parent thread ID
- `parentCheckpoint` - For branching conversations (time-travel)

**Example:**
```typescript
{
  id: "msg_abc123",
  timestamp: "2025-01-15T10:30:00Z",
  threadId: "thread_550e8400",
  parentCheckpoint: "checkpoint_xyz789"
}
```

**Why:** Message metadata enables:
- Chronological ordering
- Thread association
- Conversation branching (checkpoints)

## Thread Operations

### Creating a New Thread

```typescript
// Start new conversation
const newThread: ThreadState = {
  threadId: null,
  messages: [],
  isLoading: false,
  error: null,
};

// Clear URL params
setSearchParams({});
```

### Loading an Existing Thread

```typescript
// Get thread ID from URL
const threadId = searchParams.get("threadId");

// Fetch thread history
const thread = await client.threads.get(threadId);

// Update state
setThreadState({
  threadId: thread.thread_id,
  messages: thread.values.messages || [],
  isLoading: false,
  error: null,
});
```

### Updating Thread State

```typescript
// Add new message
setThreadState(prev => ({
  ...prev,
  messages: [...prev.messages, newMessage],
  isLoading: true,
}));
```

### Clearing Thread

```typescript
// Reset to initial state
setThreadState({
  threadId: null,
  messages: [],
  isLoading: false,
  error: null,
});

// Clear URL
setSearchParams({});
```

## Thread Branching (Time Travel)

LangGraph supports conversation branching through checkpoints.

### Checkpoint Structure

```typescript
interface Checkpoint {
  checkpoint_id: string;
  parent_checkpoint_id?: string;
  thread_id: string;
  values: GraphState;
  timestamp: string;
}
```

### Branching Flow

```typescript
// Original conversation
Thread: [Message1, Message2, Message3]
Checkpoint: checkpoint_A

// User goes back to Message2 and sends different message
Thread: [Message1, Message2, Message4]
Checkpoint: checkpoint_B (parent: checkpoint_A)

// Now two branches exist from Message2
```

**Why:** Checkpoints enable "what if" scenarios where users can explore different conversation paths.

## Thread Limits and Constraints

### Message Limits

- **Practical limit:** ~100-200 messages per thread (context window)
- **No hard limit:** Backend may paginate for very long threads
- **UI optimization:** Virtual scrolling for performance

### Size Limits

- **Message content:** ~100KB per message
- **Total thread:** Limited by LLM context window (varies by model)
- **Multimodal:** Image size limits apply (see [11-multimodal.md](/home/user/tiler2-ui/docs/11-multimodal.md))

## Thread State Management

### Stream Provider Pattern

```typescript
export type StreamContextType = ReturnType<typeof useTypedStream> & {
  currentRunId: string | null;
  threadId: string | null;
  error: Error | null;
  clearError: () => void;
  retryStream: () => Promise<void>;
};
```

**Why:** The stream provider manages thread state, streaming connections, and error handling in a centralized context.

### State Updates During Streaming

```typescript
// Initial state
{ threadId: "thread_123", messages: [msg1, msg2], isLoading: true }

// Streaming update 1
{ messages: [msg1, msg2, partialMsg3] }

// Streaming update 2
{ messages: [msg1, msg2, moreCompleteMsg3] }

// Final state
{ threadId: "thread_123", messages: [msg1, msg2, completeMsg3], isLoading: false }
```

**Why:** Streaming provides incremental updates, creating a real-time conversation experience.

## Best Practices

### 1. Always Check Thread ID Before Operations

```typescript
if (!threadId) {
  console.error("Thread ID is required");
  return;
}
```

### 2. Handle Null States Gracefully

```typescript
const currentThread = threadId || "new";
const messageCount = messages?.length || 0;
```

### 3. Validate Thread Data

```typescript
function isValidThread(state: unknown): state is ThreadState {
  return (
    typeof state === "object" &&
    state !== null &&
    "threadId" in state &&
    "messages" in state &&
    Array.isArray((state as ThreadState).messages)
  );
}
```

### 4. Preserve Thread Context

When navigating away, save thread ID:
```typescript
// Save to URL
setSearchParams({ threadId: currentThreadId });

// Or save to state management
localStorage.setItem("lastThreadId", currentThreadId);
```

## Common Issues

### Issue: Thread ID Not Updating After First Message

**Cause:** Not updating state with server-assigned thread ID

**Solution:**
```typescript
// Update thread ID from response
const response = await sendMessage(...);
if (response.thread_id) {
  setThreadState(prev => ({ ...prev, threadId: response.thread_id }));
}
```

### Issue: Messages Duplicating

**Cause:** Adding messages multiple times during re-renders

**Solution:** Use proper dependency arrays in useEffect:
```typescript
useEffect(() => {
  // Only run when threadId changes
}, [threadId]);
```

### Issue: Lost Thread Context

**Cause:** URL params cleared accidentally

**Solution:** Always update URL when thread changes:
```typescript
useEffect(() => {
  if (threadId) {
    setSearchParams({ threadId });
  }
}, [threadId, setSearchParams]);
```

## Related Documentation

- See [34-type-definitions.md](/home/user/tiler2-ui/docs/34-type-definitions.md) for type details
- See [35-message-format.md](/home/user/tiler2-ui/docs/35-message-format.md) for message structure
- See [09-thread-management.md](/home/user/tiler2-ui/docs/09-thread-management.md) for implementation
- See [06-state-management.md](/home/user/tiler2-ui/docs/06-state-management.md) for state patterns

---

**Next:** [37-testing-strategy.md](/home/user/tiler2-ui/docs/37-testing-strategy.md)
