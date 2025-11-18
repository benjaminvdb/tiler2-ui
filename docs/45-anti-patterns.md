# Anti-Patterns

This document describes common mistakes, deprecated patterns, and practices to avoid in this codebase.

## Overview

Anti-patterns are common but problematic coding approaches that lead to bugs, poor performance, or maintainability issues. Understanding what NOT to do is as important as knowing best practices.

## React Anti-Patterns

### 1. Mutating State Directly

```typescript
// ❌ NEVER DO THIS - Mutating state
function addMessage(newMessage: Message) {
  messages.push(newMessage); // Mutation!
  setMessages(messages); // React won't detect change
}

// ✅ DO THIS - Create new array
function addMessage(newMessage: Message) {
  setMessages([...messages, newMessage]); // New array
}

// ✅ ALSO GOOD - Functional update
function addMessage(newMessage: Message) {
  setMessages(prev => [...prev, newMessage]);
}
```

**Why:** React relies on reference equality to detect changes. Mutating doesn't create a new reference.

### 2. Using Index as Key

```typescript
// ❌ BAD - Index as key
{messages.map((message, index) => (
  <Message key={index} message={message} />
))}

// ✅ GOOD - Unique ID as key
{messages.map((message) => (
  <Message key={message.id} message={message} />
))}
```

**Why:** Indices change when items are added/removed, causing React to lose component state and re-render unnecessarily.

### 3. Missing Dependencies in useEffect

```typescript
// ❌ BAD - Missing dependency
useEffect(() => {
  sendMessage(content); // Uses 'content' but not in deps
}, []); // Empty deps = runs once, uses stale 'content'

// ✅ GOOD - Include all dependencies
useEffect(() => {
  sendMessage(content);
}, [content]);

// ✅ ALSO GOOD - ESLint will warn about this
// Follow the warnings!
```

**Why:** Missing dependencies cause stale closures - using old values instead of current ones.

### 4. Creating Objects/Functions in Render

```typescript
// ❌ BAD - New object every render
function Component() {
  const config = { apiUrl, assistantId }; // New object every time

  return <Child config={config} />; // Child re-renders unnecessarily
}

// ✅ GOOD - Memoize objects
function Component() {
  const config = useMemo(
    () => ({ apiUrl, assistantId }),
    [apiUrl, assistantId]
  );

  return <Child config={config} />;
}

// ❌ BAD - New function every render
function Component() {
  return <button onClick={() => handleClick()}>Click</button>;
  // New function created every render
}

// ✅ GOOD - Stable function reference
function Component() {
  const handleClick = useCallback(() => {
    // Handle click
  }, []);

  return <button onClick={handleClick}>Click</button>;
}
```

**Why:** New objects/functions break memoization and cause unnecessary re-renders.

### 5. Side Effects in Render

```typescript
// ❌ BAD - Side effects during render
function Component({ userId }) {
  // This runs on EVERY render!
  fetch(`/api/users/${userId}`).then(setUser);

  return <div>{user?.name}</div>;
}

// ✅ GOOD - Side effects in useEffect
function Component({ userId }) {
  useEffect(() => {
    fetch(`/api/users/${userId}`).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

**Why:** Render functions should be pure. Side effects belong in useEffect.

### 6. Too Many useState Calls

```typescript
// ❌ BAD - Too many related states
function Component() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // ... many more
}

// ✅ GOOD - Group related state
function Component() {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Update with spread
  setUser({ ...user, firstName: "John" });
}

// ✅ EVEN BETTER - Use useReducer
function Component() {
  const [user, dispatch] = useReducer(userReducer, initialUser);

  dispatch({ type: "SET_FIRST_NAME", value: "John" });
}
```

**Why:** Related state should be grouped for easier management and updates.

## TypeScript Anti-Patterns

### 1. Using 'any' Type

```typescript
// ❌ BAD - Defeats TypeScript's purpose
function processData(data: any) {
  return data.value; // No type checking!
}

// ✅ GOOD - Use specific types
function processData(data: ThreadState) {
  return data.messages; // Type-safe!
}

// ✅ ALSO GOOD - Use 'unknown' for truly dynamic data
function processData(data: unknown) {
  if (isThreadState(data)) {
    return data.messages; // Type narrowed
  }
}
```

**Why:** `any` removes all type safety and defeats the purpose of TypeScript.

### 2. Type Assertions Without Validation

```typescript
// ❌ BAD - Unsafe assertion
const data = response as ThreadState;
// What if response doesn't match ThreadState?

// ✅ GOOD - Validate before asserting
function isThreadState(value: unknown): value is ThreadState {
  return (
    typeof value === "object" &&
    value !== null &&
    "threadId" in value &&
    "messages" in value
  );
}

const data = response;
if (isThreadState(data)) {
  // Now safe to use as ThreadState
}

// ✅ EVEN BETTER - Use Zod for runtime validation
const threadStateSchema = z.object({
  threadId: z.string().nullable(),
  messages: z.array(messageSchema),
  isLoading: z.boolean(),
});

const data = threadStateSchema.parse(response);
```

**Why:** Type assertions don't validate runtime data. Use type guards or runtime validation.

### 3. Optional Chaining Overuse

```typescript
// ❌ BAD - Excessive optional chaining
const name = user?.profile?.name?.first?.toUpperCase();
// Hides real problem: undefined structure

// ✅ GOOD - Make types explicit
interface User {
  profile: {
    name: {
      first: string;
    };
  };
}

const name = user.profile.name.first.toUpperCase();
// If this fails, there's a real bug to fix
```

**Why:** Excessive `?.` hides design problems. Use proper types instead.

### 4. Ignoring TypeScript Errors

```typescript
// ❌ BAD - Ignoring errors
// @ts-ignore
const value = dangerousOperation();

// @ts-expect-error
const result = brokenFunction();

// ✅ GOOD - Fix the underlying issue
const value: string = safeDangerousOperation();
const result = fixedFunction();

// ✅ ACCEPTABLE - Only when absolutely necessary
// Provide explanation
// @ts-expect-error - Third-party library has incorrect types
// See issue: https://github.com/lib/issues/123
const result = thirdPartyFunction();
```

**Why:** TypeScript errors usually indicate real bugs. Fix them instead of hiding them.

## Performance Anti-Patterns

### 1. Premature Optimization

```typescript
// ❌ BAD - Optimizing before measuring
function Component() {
  // Memoizing everything "just in case"
  const value1 = useMemo(() => simpleValue, []);
  const value2 = useMemo(() => 2 + 2, []);
  const value3 = useMemo(() => "hello", []);
  // Overkill for simple operations!
}

// ✅ GOOD - Only optimize when needed
function Component() {
  // Simple values don't need memoization
  const value = simpleValue;

  // Only memoize expensive operations
  const expensiveResult = useMemo(() => {
    return complexCalculation(largeArray);
  }, [largeArray]);
}
```

**Why:** Memoization has overhead. Only use it for expensive operations identified by profiling.

### 2. Overusing React.memo

```typescript
// ❌ BAD - Memoizing everything
export const SimpleButton = React.memo(({ onClick, text }) => (
  <button onClick={onClick}>{text}</button>
));
// Tiny component, unlikely to benefit from memoization

// ✅ GOOD - Only memoize expensive components
export const ExpensiveList = React.memo(({ items }) => (
  <div>
    {items.map(item => (
      <ComplexItem key={item.id} item={item} />
    ))}
  </div>
));
```

**Why:** React.memo has overhead. Profile first, then optimize expensive components.

### 3. Blocking the Main Thread

```typescript
// ❌ BAD - Synchronous heavy computation
function Component() {
  const processedData = data.map(item => {
    // Heavy computation blocks UI!
    return heavyProcessing(item);
  });

  return <div>{processedData}</div>;
}

// ✅ GOOD - Async processing or Web Workers
function Component() {
  const [processedData, setProcessedData] = useState([]);

  useEffect(() => {
    // Process asynchronously
    async function process() {
      const result = await processInBackground(data);
      setProcessedData(result);
    }
    process();
  }, [data]);

  return <div>{processedData}</div>;
}

// ✅ EVEN BETTER - Use Web Worker for heavy computation
const worker = new Worker('heavy-processor.js');
worker.postMessage(data);
worker.onmessage = (e) => setProcessedData(e.data);
```

**Why:** Heavy synchronous operations freeze the UI.

## Security Anti-Patterns

### 1. Exposing Secrets

```typescript
// ❌ NEVER DO THIS - Hardcoded secrets
const apiKey = "sk_live_abc123xyz789";
const dbPassword = "mysecretpassword";

// ❌ NEVER DO THIS - Committing .env.local
git add .env.local
git commit -m "Add config"

// ✅ DO THIS - Environment variables
const apiKey = import.meta.env.VITE_API_KEY;

// ✅ DO THIS - Keep secrets in .gitignore
# .gitignore
.env.local
.env*.local
```

**Why:** Committed secrets can be exploited. Use environment variables and never commit them.

### 2. Client-Side Secrets

```typescript
// ❌ BAD - Secret API key in client
VITE_SECRET_API_KEY=sk_live_secret123
// VITE_ prefix exposes to browser!

// ✅ GOOD - Only public values with VITE_
VITE_PUBLIC_API_URL=https://api.example.com
// Secret keys stay on backend
```

**Why:** All `VITE_` variables are exposed in browser. Only use for public configuration.

### 3. Unsafe HTML Rendering

```typescript
// ❌ NEVER DO THIS - XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ NEVER DO THIS - eval is evil
eval(userCode);

// ✅ DO THIS - Sanitize user content
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

<ReactMarkdown rehypePlugins={[rehypeSanitize]}>
  {userInput}
</ReactMarkdown>
```

**Why:** Unsanitized user input enables XSS attacks.

## Accessibility Anti-Patterns

### 1. Missing Accessible Labels

```typescript
// ❌ BAD - No label or aria-label
<button onClick={handleClick}>
  <Icon />
</button>

// ✅ GOOD - Accessible label
<button onClick={handleClick} aria-label="Send message">
  <SendIcon />
</button>

// ❌ BAD - Placeholder as label
<input placeholder="Email" />

// ✅ GOOD - Proper label
<label htmlFor="email">Email</label>
<input id="email" placeholder="you@example.com" />
```

**Why:** Screen readers need text labels to describe interactive elements.

### 2. Div/Span as Button

```typescript
// ❌ BAD - Non-semantic element as button
<div onClick={handleClick}>Click me</div>

// ✅ GOOD - Semantic button element
<button onClick={handleClick}>Click me</button>

// ✅ ALSO GOOD - Link for navigation
<a href="/page">Go to page</a>
```

**Why:** Semantic elements provide keyboard navigation and screen reader support.

### 3. Missing Keyboard Support

```typescript
// ❌ BAD - Only mouse support
<div onClick={handleClick}>Click me</div>

// ✅ GOOD - Keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  }}
>
  Click me
</div>

// ✅ BETTER - Use <button> (handles keyboard automatically)
<button onClick={handleClick}>Click me</button>
```

**Why:** Keyboard users can't interact with click-only elements.

## Code Organization Anti-Patterns

### 1. Mega Components

```typescript
// ❌ BAD - 500+ line component
function ChatView() {
  // 100 lines of state
  // 200 lines of functions
  // 200 lines of JSX
  // Impossible to maintain!
}

// ✅ GOOD - Split into smaller components
function ChatView() {
  return (
    <>
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </>
  );
}
```

**Why:** Large components are hard to understand, test, and maintain.

### 2. Deeply Nested Code

```typescript
// ❌ BAD - Deeply nested
function process(data) {
  if (data) {
    if (data.valid) {
      if (data.items) {
        if (data.items.length > 0) {
          // Finally do something
        }
      }
    }
  }
}

// ✅ GOOD - Early returns
function process(data) {
  if (!data) return;
  if (!data.valid) return;
  if (!data.items?.length) return;

  // Do something
}
```

**Why:** Deep nesting is hard to read. Use early returns to flatten code.

### 3. Magic Numbers/Strings

```typescript
// ❌ BAD - Magic numbers
if (status === 200) { /* ... */ }
setTimeout(() => { /* ... */ }, 5000);

// ✅ GOOD - Named constants
const HTTP_OK = 200;
const RETRY_DELAY_MS = 5000;

if (status === HTTP_OK) { /* ... */ }
setTimeout(() => { /* ... */ }, RETRY_DELAY_MS);

// ❌ BAD - Magic strings
if (type === "human") { /* ... */ }

// ✅ GOOD - Enums or constants
enum MessageType {
  Human = "human",
  AI = "ai",
  Tool = "tool",
}

if (type === MessageType.Human) { /* ... */ }
```

**Why:** Named constants are self-documenting and easier to update.

## Testing Anti-Patterns (When Tests Added)

### 1. Testing Implementation Details

```typescript
// ❌ BAD - Testing internal state
expect(component.state.isLoading).toBe(true);

// ✅ GOOD - Testing user-visible behavior
expect(screen.getByText("Loading...")).toBeInTheDocument();
```

**Why:** Tests should verify behavior, not implementation. Implementation can change.

### 2. Too Many Mocks

```typescript
// ❌ BAD - Mocking everything
vi.mock("@/features/thread");
vi.mock("@/features/chat");
vi.mock("@/shared/utils");
// Not testing real integration!

// ✅ GOOD - Only mock external dependencies
vi.mock("@langchain/langgraph-sdk");
// Test real component integration
```

**Why:** Over-mocking defeats the purpose of integration tests.

## Git Anti-Patterns

### 1. Meaningless Commit Messages

```bash
# ❌ BAD
git commit -m "fix"
git commit -m "WIP"
git commit -m "updates"

# ✅ GOOD
git commit -m "fix(auth): resolve redirect loop on login"
git commit -m "feat(chat): add message search"
git commit -m "refactor(thread): simplify state management"
```

**Why:** Good commit messages create readable project history.

### 2. Committing Generated Files

```bash
# ❌ BAD
git add dist/
git add node_modules/

# ✅ GOOD - Add to .gitignore
dist/
node_modules/
.env.local
```

**Why:** Generated files pollute Git history and cause merge conflicts.

## Related Documentation

- See [38-code-quality.md](/home/user/tiler2-ui/docs/38-code-quality.md) for quality standards
- See [20-coding-conventions.md](/home/user/tiler2-ui/docs/20-coding-conventions.md) for best practices
- See [21-react-patterns.md](/home/user/tiler2-ui/docs/21-react-patterns.md) for React patterns
- See [41-security.md](/home/user/tiler2-ui/docs/41-security.md) for security practices

---

**Next:** [46-dependencies.md](/home/user/tiler2-ui/docs/46-dependencies.md)
