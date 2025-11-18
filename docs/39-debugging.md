# Debugging

This document provides comprehensive debugging strategies and tools for troubleshooting issues during development and production.

## Overview

Effective debugging requires:
- **Browser DevTools** - Inspecting runtime behavior
- **React DevTools** - Component tree and state inspection
- **VS Code debugging** - Breakpoint-based debugging
- **Network inspection** - API and streaming debugging
- **Source maps** - Production debugging

## Browser DevTools

### Opening DevTools

- **Chrome/Edge:** F12 or Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
- **Firefox:** F12 or Cmd+Option+I (Mac) / Ctrl+Shift+I (Windows)
- **Safari:** Cmd+Option+I (enable Developer menu first)

### Console Debugging

#### Basic Console Methods

```typescript
// Simple logging
console.log("Message sent:", message);

// Structured logging
console.log({ threadId, messageCount, isLoading });

// Warning messages
console.warn("API key not configured");

// Error messages
console.error("Failed to send message:", error);

// Table view for arrays/objects
console.table(messages);

// Group related logs
console.group("Message Processing");
console.log("Validation:", isValid);
console.log("Content:", content);
console.groupEnd();
```

#### Advanced Console Features

```typescript
// Measure execution time
console.time("API Call");
await sendMessage();
console.timeEnd("API Call"); // API Call: 234ms

// Trace function calls
console.trace("How did we get here?");

// Conditional logging
console.assert(threadId !== null, "Thread ID should exist");

// Count occurrences
function handleMessage() {
  console.count("handleMessage called");
}
```

**Why:** Console methods provide quick insights without stopping execution.

### Debugger Statement

```typescript
function processMessage(message: Message) {
  debugger; // Execution pauses here when DevTools is open

  const validated = validateMessage(message);
  return validated;
}
```

**Why:** `debugger` pauses execution and opens DevTools automatically.

### Network Tab

#### Inspecting API Calls

1. Open Network tab
2. Filter by "Fetch/XHR"
3. Click request to see:
   - **Headers** - Request/response headers
   - **Payload** - Request body
   - **Response** - Response data
   - **Timing** - Performance breakdown

#### Common Network Debugging

```typescript
// Check if request was made
// Look for: POST /api/threads/{threadId}/runs/stream

// Inspect request payload
{
  "input": {
    "messages": [...]
  },
  "config": {...}
}

// Check response status
// 200 OK - Success
// 401 Unauthorized - Auth issue
// 500 Internal Server Error - Backend error
```

**Why:** Network tab reveals API issues, authentication problems, and performance bottlenecks.

### Application Tab

#### Inspecting Storage

- **Local Storage** - Persistent data
- **Session Storage** - Session data
- **Cookies** - Auth tokens
- **IndexedDB** - Structured data

```typescript
// View stored data
localStorage.getItem("lastThreadId");

// Clear storage for testing
localStorage.clear();
sessionStorage.clear();
```

**Why:** Storage inspection reveals data persistence issues and auth token problems.

### Performance Tab

#### Recording Performance

1. Click record button
2. Perform action (e.g., send message)
3. Stop recording
4. Analyze flame graph

**Look for:**
- Long tasks (>50ms)
- Layout thrashing
- Memory leaks
- Unnecessary re-renders

**Why:** Performance profiling identifies bottlenecks and optimization opportunities.

## React DevTools

### Installation

Install the browser extension:
- [Chrome/Edge](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Components Tab

#### Inspecting Component Tree

1. Open React DevTools
2. Select "Components" tab
3. Click component in tree
4. View props, state, hooks

```typescript
// Example inspection of ThreadView component
Props:
  threadId: "550e8400-..."
  messages: Array(5)
  isLoading: false

Hooks:
  State(messages): Array(5)
  State(isLoading): false
  Effect: /* ... */
  Context: { apiUrl, assistantId }
```

**Why:** Component inspection reveals prop flow and state issues.

#### Finding Components

- **Search** - Type component name in search box
- **Select element** - Click inspect icon, then click element in page
- **Filter** - Filter by component type or props

#### Editing Props/State

Right-click component → "Edit value" to test different states:

```typescript
// Change state to test loading UI
isLoading: true

// Change props to test edge cases
messages: []
```

**Why:** Live editing helps test different scenarios without code changes.

### Profiler Tab

#### Recording Renders

1. Click "Start profiling"
2. Perform action
3. Click "Stop profiling"
4. Analyze render timeline

**Metrics shown:**
- Render duration
- Component render count
- Commit phase duration
- Render reason (props, state, context)

**Why:** Profiler identifies unnecessary re-renders and performance issues.

## VS Code Debugging

### Setup

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    },
    {
      "type": "chrome",
      "request": "attach",
      "name": "Attach to Chrome",
      "port": 9222,
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### Using Breakpoints

#### Setting Breakpoints

1. Click left gutter in VS Code editor
2. Red dot appears at line
3. Run debugger (F5)
4. Execution pauses at breakpoint

```typescript
function sendMessage(content: string) {
  // Set breakpoint on next line
  const message = createMessage(content);

  // Hover variables to inspect values
  return message;
}
```

#### Conditional Breakpoints

Right-click breakpoint → "Edit Breakpoint" → Add condition:

```typescript
// Only break when specific thread
threadId === "550e8400-e29b-41d4-a716-446655440000"

// Only break when error occurs
error !== null

// Only break after 5 iterations
index > 5
```

**Why:** Conditional breakpoints reduce noise when debugging specific scenarios.

#### Logpoints

Right-click gutter → "Add Logpoint":

```typescript
// Log without stopping execution
Message sent: {message.content}, Thread: {threadId}
```

**Why:** Logpoints provide logging without modifying code.

### Debug Console

When paused at breakpoint:

```typescript
// Evaluate expressions
> message.content
"What is the weather?"

// Call functions
> validateMessage(message)
true

// Modify variables
> threadId = "new-thread-id"
```

**Why:** Interactive console enables runtime experimentation.

## Debugging Streaming Issues

### SSE (Server-Sent Events) Debugging

#### Network Tab Inspection

1. Open Network tab
2. Look for streaming request (usually shows "pending")
3. Click request
4. View "EventStream" tab (Chrome) or response (Firefox)

```typescript
// SSE events appear as:
event: messages
data: {"type":"ai","content":"Hello"}

event: end
data: {"status":"complete"}
```

#### Console Logging Streams

```typescript
// In stream provider
for await (const chunk of stream) {
  console.log("Stream chunk:", chunk);
  // Check if chunks are arriving
  // Verify chunk structure
}
```

#### Common Streaming Issues

**Issue: Stream hangs**
```typescript
// Check if async iterator is awaited
for await (const chunk of stream) { // ✓ Correct
  // ...
}

// Not this:
for (const chunk of stream) { // ✗ Wrong
  // ...
}
```

**Issue: Partial messages**
```typescript
// Buffer incomplete chunks
let buffer = "";
for await (const chunk of stream) {
  buffer += chunk;
  try {
    const parsed = JSON.parse(buffer);
    // Process parsed
    buffer = ""; // Reset after successful parse
  } catch {
    // Continue buffering
  }
}
```

**Why:** Streaming debugging requires understanding async iteration and event handling.

## Network Debugging

### Request Inspection

#### Headers

```bash
# Check authentication
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

# Check content type
Content-Type: application/json

# Check CORS
Access-Control-Allow-Origin: *
```

#### Timing Breakdown

```
Queueing: 2ms        # Time in request queue
Stalled: 15ms        # Time before request sent
DNS Lookup: 0ms      # DNS resolution
Initial connection: 45ms  # TCP handshake
SSL: 89ms            # SSL handshake
Request sent: 1ms    # Time to send request
Waiting (TTFB): 234ms    # Time to first byte
Content Download: 12ms   # Download time
```

**Why:** Timing reveals bottlenecks (slow DNS, SSL, or server response).

### Throttling Network

#### Simulating Slow Connections

Network tab → Throttling dropdown → Select:
- Fast 3G
- Slow 3G
- Offline

**Why:** Tests how app behaves on slow connections.

### Request Blocking

Block specific requests to test error handling:

Network tab → Right-click request → "Block request URL"

**Why:** Simulates API failures to test error handling.

## Common Debugging Scenarios

### Scenario 1: Message Not Appearing

**Steps:**
1. Check console for errors
2. Verify message in React DevTools state
3. Check if component is re-rendering
4. Inspect network tab for API response
5. Verify message ID and structure

**Common causes:**
- Missing key prop on message component
- State not updating
- Conditional rendering hiding message
- API returning unexpected format

### Scenario 2: Auth Redirect Loop

**Steps:**
1. Check Application tab → Cookies
2. Verify auth token exists
3. Check Network tab for 401 responses
4. Inspect Auth0 callback URL
5. Verify environment variables

**Common causes:**
- Invalid Auth0 configuration
- Expired token
- Incorrect callback URL
- CORS issues

### Scenario 3: Streaming Not Working

**Steps:**
1. Check Network tab for streaming request
2. Verify request is "pending" (not completed)
3. Inspect EventStream tab for events
4. Check console for stream errors
5. Verify async iteration syntax

**Common causes:**
- Missing `await` in for loop
- Stream error not caught
- Network timeout
- Backend not sending SSE format

### Scenario 4: Component Not Re-rendering

**Steps:**
1. Open React DevTools Profiler
2. Record interaction
3. Check if component rendered
4. Inspect hooks/state changes
5. Verify dependency arrays

**Common causes:**
- useEffect missing dependencies
- useMemo/useCallback stale closure
- Props not changing (same reference)
- React.memo preventing update

## Production Debugging

### Source Maps

Source maps are enabled in `/home/user/tiler2-ui/vite.config.ts`:

```typescript
build: {
  sourcemap: true, // Generates .map files
}
```

**Why:** Source maps allow debugging minified production code with original source code.

### Sentry Integration

Sentry captures production errors with context:

```typescript
// Automatic error capture
Sentry.captureException(error);

// Add context
Sentry.setContext("thread", {
  threadId,
  messageCount,
});

// Add breadcrumbs
Sentry.addBreadcrumb({
  message: "User sent message",
  level: "info",
});
```

**Why:** Sentry provides production error tracking with stack traces and context.

### Production Console

```typescript
// Only log in development
if (import.meta.env.DEV) {
  console.log("Debug info:", data);
}

// Or use environment check
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}
```

**Why:** Prevents sensitive data logging in production.

## Debugging Tools

### React Query DevTools (if added)

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<ReactQueryDevtools initialIsOpen={false} />
```

Shows:
- Query state (loading, success, error)
- Cache entries
- Refetch behavior

### Redux DevTools (if added)

Browser extension for Redux state inspection:
- Action history
- State diff
- Time-travel debugging

### Why DevTools Extensions Matter

DevTools provide insights impossible through console logging:
- Component tree visualization
- State time-travel
- Performance profiling
- Network waterfall

## Best Practices

### 1. Use Descriptive Console Messages

```typescript
// Bad
console.log(data);

// Good
console.log("Thread loaded:", { threadId, messageCount: data.length });
```

### 2. Remove Debug Code Before Commit

```typescript
// Remove these before committing:
console.log("Debug:", ...);
debugger;
```

### 3. Use Conditional Logging

```typescript
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log("Stream chunk:", chunk);
}
```

### 4. Leverage TypeScript for Debugging

```typescript
// TypeScript reveals type issues immediately
const message: Message = data; // Error if shape doesn't match
```

### 5. Test Edge Cases

```typescript
// Test with various inputs
testMessage({ content: "" }); // Empty
testMessage({ content: "a".repeat(10000) }); // Very long
testMessage({ content: null }); // Invalid
```

## Related Documentation

- See [38-code-quality.md](/home/user/tiler2-ui/docs/38-code-quality.md) for quality tools
- See [43-common-issues.md](/home/user/tiler2-ui/docs/43-common-issues.md) for known problems
- See [17-error-handling.md](/home/user/tiler2-ui/docs/17-error-handling.md) for error patterns
- See [26-monitoring.md](/home/user/tiler2-ui/docs/26-monitoring.md) for production monitoring

---

**Next:** [40-contributing.md](/home/user/tiler2-ui/docs/40-contributing.md)
