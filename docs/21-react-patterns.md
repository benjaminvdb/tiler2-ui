# React Patterns

This document outlines React patterns and best practices used in the Tiler2 UI project. These patterns ensure consistent, maintainable, and performant React applications.

## Table of Contents

- [Component Patterns](#component-patterns)
- [Hook Patterns](#hook-patterns)
- [Context Provider Patterns](#context-provider-patterns)
- [Render Props and Compound Components](#render-props-and-compound-components)
- [Component Lifecycle with Hooks](#component-lifecycle-with-hooks)
- [Performance Optimization](#performance-optimization)
- [Event Handling Patterns](#event-handling-patterns)
- [Form Handling Patterns](#form-handling-patterns)
- [Conditional Rendering](#conditional-rendering)
- [Error Boundary Patterns](#error-boundary-patterns)
- [Best Practices](#best-practices)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

## Component Patterns

### Functional Components (Preferred)

**Always use functional components with hooks:**

```tsx
// Good - functional component
import React from "react";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "destructive";
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = "default"
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
};

// Bad - class component (avoid)
class Button extends React.Component<ButtonProps> {
  render() {
    return <button onClick={this.props.onClick}>{this.props.children}</button>;
  }
}
```

**Why:** Functional components are simpler, more testable, and work better with hooks.

### Component Composition

**Build complex components from simple ones:**

Example from `/home/user/tiler2-ui/src/features/side-panel/components/thread-actions-menu.tsx`:

```tsx
export const ThreadActionsMenu = ({
  threadId,
  threadTitle,
  onRename,
  onDelete,
}: ThreadActionsMenuProps): React.JSX.Element => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      {/* Dropdown Menu Component */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label="Thread actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={() => setRenameDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Rename Thread
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Thread
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog Components */}
      <RenameThreadDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        threadId={threadId}
        currentTitle={threadTitle}
        onRename={onRename}
      />

      <DeleteThreadConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        threadId={threadId}
        threadTitle={threadTitle}
        onConfirm={onDelete}
      />
    </>
  );
};
```

**Why:** Composition makes components more reusable and easier to test. Each component has a single responsibility.

### Component Variants with CVA

**Use class-variance-authority for component variants:**

Example from `/home/user/tiler2-ui/src/shared/components/ui/button.tsx`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export const Button: React.FC<ButtonProps> = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
```

**Why:** CVA provides type-safe variants with excellent DX and maintains a single source of truth for component styles.

### Polymorphic Components with Slot

**Use Radix UI's Slot for polymorphic components:**

```tsx
import { Slot } from "@radix-ui/react-slot";

type ButtonProps = {
  asChild?: boolean;
  children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ asChild, children, ...props }) => {
  const Comp = asChild ? Slot : "button";
  return <Comp {...props}>{children}</Comp>;
};

// Usage: renders as Link component
<Button asChild>
  <Link to="/home">Go Home</Link>
</Button>
```

**Why:** The `asChild` pattern allows consumers to control the rendered element without wrapper divs.

## Hook Patterns

### Custom Hook Structure

**Organize custom hooks with clear return values:**

Example from `/home/user/tiler2-ui/src/features/file-upload/hooks/index.ts`:

```tsx
interface UseFileUploadOptions {
  initialBlocks?: MultimodalContentBlock[];
}

export function useFileUpload({
  initialBlocks = [],
}: UseFileUploadOptions = {}) {
  // State
  const [contentBlocks, setContentBlocks] = useState<MultimodalContentBlock[]>(initialBlocks);
  const [dragOver, setDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Compose other hooks
  useDragDropHandlers({
    contentBlocks,
    setContentBlocks,
    setDragOver,
    containerRef: dropRef,
  });

  const { handleFileUpload, handlePaste, removeBlock, resetBlocks } = useFileHandlers({
    contentBlocks,
    setContentBlocks,
  });

  // Return public API
  return {
    contentBlocks,
    setContentBlocks,
    handleFileUpload,
    dropRef,
    removeBlock,
    resetBlocks,
    dragOver,
    handlePaste,
  };
}
```

**Why:** Clear return objects document what the hook provides. Composing smaller hooks keeps code modular.

### Hook Composition

**Break complex hooks into smaller, focused hooks:**

Example from `/home/user/tiler2-ui/src/features/thread/components/hooks/use-thread-state.ts`:

```tsx
export function useThreadState(): ThreadStateValue {
  // Compose specialized hooks
  const [artifactContext, setArtifactContext] = useArtifactContext();
  const [artifactOpen, closeArtifact] = useArtifactOpen();
  const [threadId] = useSearchParamState("threadId");
  const [hideToolCalls, setHideToolCalls] = useSearchParamState("hideToolCalls");

  // Local state
  const [input, setInput] = useState("");
  const [firstTokenReceived, setFirstTokenReceived] = useState(false);
  const [isRespondingToInterrupt, setIsRespondingToInterrupt] = useState(false);

  // Refs for mutable values
  const lastError = useRef<string | undefined>(undefined);
  const prevMessageLength = useRef(0);

  return {
    artifactContext,
    setArtifactContext,
    artifactOpen,
    closeArtifact,
    threadId,
    hideToolCalls: hideToolCalls ?? true,
    setHideToolCalls,
    input,
    setInput,
    firstTokenReceived,
    setFirstTokenReceived,
    isRespondingToInterrupt,
    setIsRespondingToInterrupt,
    lastError,
    prevMessageLength,
  };
}
```

**Why:** Small, focused hooks are easier to test and reuse. Composition creates powerful abstractions.

### Hook Dependencies

**Always include all dependencies in hook arrays:**

```tsx
// Good - all dependencies listed
const handleSubmit = useCallback(
  (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(input);
  },
  [input, onSubmit]
);

// Bad - missing dependency
const handleSubmit = useCallback(
  (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(input); // input is used but not in deps
  },
  [onSubmit]
);
```

**Why:** Missing dependencies cause stale closures and hard-to-debug issues.

### useEffect Patterns

**Separate concerns into multiple useEffect calls:**

Example from `/home/user/tiler2-ui/src/App.tsx`:

```tsx
// Good - separate effects for separate concerns
function SentryUserContext() {
  const { user } = useAuth0();

  // Effect 1: Sync user to Sentry
  useEffect(() => {
    if (user) {
      Sentry.setUser({
        id: user.sub ?? "",
        email: user.email,
        username: user.name,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  return null;
}

// Bad - mixed concerns in one effect
function SentryUserContext() {
  const { user } = useAuth0();

  useEffect(() => {
    // Syncing user
    if (user) {
      Sentry.setUser({ id: user.sub ?? "" });
    }

    // Unrelated: tracking page views
    trackPageView();

    // Unrelated: fetching data
    fetchUserData();
  }, [user]); // Confusing dependencies

  return null;
}
```

**Why:** Separate effects make dependencies clearer and cleanup easier to manage.

### Cleanup in useEffect

**Always clean up side effects:**

Example from `/home/user/tiler2-ui/src/shared/hooks/use-media-query.tsx`:

```tsx
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Subscribe
    media.addEventListener("change", listener);

    // Cleanup function
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
```

**Why:** Cleanup prevents memory leaks and stale event listeners.

## Context Provider Patterns

### Provider with Custom Hook

**Always provide a custom hook for context consumption:**

Example from `/home/user/tiler2-ui/src/features/chat/providers/chat-provider.tsx`:

```tsx
// 1. Define context type
interface ChatContextType {
  chatStarted: boolean;
  input: string;
  contentBlocks: ContentBlocks;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  // ... other values
}

// 2. Create context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// 3. Provider component
interface ChatProviderProps {
  children: ReactNode;
  value: ChatContextType;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children, value }) => {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// 4. Custom hook with runtime check
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
```

**Why:** Custom hooks provide better error messages and prevent undefined context access.

### Provider Composition

**Compose providers for better organization:**

```tsx
// Good - composed providers
export function App() {
  return (
    <MotionConfigProvider>
      <GlobalErrorBoundary>
        <AsyncErrorBoundary>
          <NetworkStatusProvider>
            <Routes>
              {/* routes */}
            </Routes>
          </NetworkStatusProvider>
        </AsyncErrorBoundary>
      </GlobalErrorBoundary>
    </MotionConfigProvider>
  );
}
```

**Why:** Composition makes provider hierarchy clear and allows selective wrapping.

### Memoize Provider Values

**Memoize context values to prevent unnecessary re-renders:**

Example from `/home/user/tiler2-ui/src/core/providers/stream.tsx`:

```tsx
export const StreamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const clientConfig = getClientConfig();

  // Memoize computed values
  const finalApiUrl = useMemo(() => clientConfig.apiUrl, [clientConfig.apiUrl]);
  const finalAssistantId = useMemo(
    () => clientConfig.assistantId,
    [clientConfig.assistantId]
  );

  return (
    <StreamSession
      apiUrl={finalApiUrl}
      assistantId={finalAssistantId}
    >
      {children}
    </StreamSession>
  );
};
```

**Why:** Prevents consumers from re-rendering when provider re-renders but values haven't changed.

## Render Props and Compound Components

### Compound Component Pattern

**Group related components together:**

```tsx
// Dialog components work together
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";

// Usage
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to continue?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Why:** Compound components provide flexibility while maintaining coherent behavior.

### Children as Function

**Use render props for flexible composition:**

```tsx
// Good - render prop pattern
interface LoadingProps<T> {
  data: T | null;
  isLoading: boolean;
  children: (data: T) => React.ReactNode;
}

function LoadingWrapper<T>({ data, isLoading, children }: LoadingProps<T>) {
  if (isLoading) return <Spinner />;
  if (!data) return <ErrorMessage />;
  return <>{children(data)}</>;
}

// Usage
<LoadingWrapper data={userData} isLoading={loading}>
  {(user) => <UserProfile user={user} />}
</LoadingWrapper>
```

**Why:** Render props give consumers full control over rendering while centralizing loading/error logic.

## Component Lifecycle with Hooks

### Mount Phase

**Use useEffect with empty deps for mount-only effects:**

```tsx
function Component() {
  useEffect(() => {
    // Runs once on mount
    console.log("Component mounted");

    // Cleanup runs on unmount
    return () => {
      console.log("Component will unmount");
    };
  }, []); // Empty deps = mount/unmount only

  return <div>Content</div>;
}
```

### Update Phase

**Use useEffect with dependencies for update effects:**

```tsx
function Component({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  // Runs on mount AND when userId changes
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

### Unmount Phase

**Return cleanup functions from useEffect:**

```tsx
function Component() {
  useEffect(() => {
    const subscription = api.subscribe();

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <div>Content</div>;
}
```

## Performance Optimization

### React.memo for Component Memoization

**Memoize expensive components:**

Example from `/home/user/tiler2-ui/src/features/thread/components/chat-input-components/index.tsx`:

```tsx
const ChatInputComponent = ({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  // ... other props
}: ChatInputProps) => {
  // Component implementation
  return (
    <form onSubmit={onSubmit}>
      {/* ... */}
    </form>
  );
};

// Memoize to prevent re-renders when props haven't changed
export const ChatInput = React.memo(ChatInputComponent);
```

**Why:** Prevents re-rendering when parent re-renders but props are unchanged.

### useMemo for Expensive Calculations

**Memoize computed values:**

```tsx
function ProductList({ items }: { items: Product[] }) {
  // Expensive calculation - only recompute when items change
  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return (
    <div>
      <h2>Total: ${totalPrice}</h2>
      {items.map(item => <ProductItem key={item.id} item={item} />)}
    </div>
  );
}
```

**Why:** Prevents expensive recalculations on every render.

### useCallback for Function Memoization

**Memoize callback functions:**

Example from `/home/user/tiler2-ui/src/features/thread/components/chat-input-components/index.tsx`:

```tsx
const ChatInputComponent = ({ input, onInputChange, onSubmit }: ChatInputProps) => {
  // Memoize handler to prevent child re-renders
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e.target.value);
    },
    [onInputChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const form = e.target?.closest("form");
        form?.requestSubmit();
      }
    },
    []
  );

  return (
    <textarea
      value={input}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
};
```

**Why:** Stable function references prevent unnecessary re-renders of child components that depend on those callbacks.

### When NOT to Optimize

**Don't optimize prematurely:**

```tsx
// Bad - unnecessary memoization
const SimpleComponent = React.memo(({ text }: { text: string }) => {
  return <div>{text}</div>;
});

// Good - no memoization needed for simple components
const SimpleComponent = ({ text }: { text: string }) => {
  return <div>{text}</div>;
};
```

**Why:** Memoization has overhead. Only optimize when profiling shows performance issues.

## Event Handling Patterns

### Event Handler Naming

**Prefix handlers with `handle`:**

```tsx
// Good - clear naming
function Component() {
  const handleClick = () => { /* ... */ };
  const handleSubmit = (e: React.FormEvent) => { /* ... */ };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

**Why:** Consistent naming makes code easier to scan and understand.

### Prevent Default and Stop Propagation

**Be explicit about event behavior:**

```tsx
function ThreadActionsMenu({ onRename, onDelete }: Props) {
  return (
    <DropdownMenuTrigger asChild>
      <button
        onClick={(e) => {
          // Prevent event from bubbling to parent elements
          e.stopPropagation();
        }}
        aria-label="Thread actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </DropdownMenuTrigger>
  );
}
```

**Why:** Explicit event control prevents unexpected behavior from event bubbling.

### Inline vs Declared Handlers

**Declare handlers outside JSX for complex logic:**

```tsx
// Good - complex logic declared outside
function Component() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    // ... complex validation and submission logic
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}

// Good - simple inline handler
function Component() {
  return (
    <button onClick={() => console.log("clicked")}>
      Click me
    </button>
  );
}
```

**Why:** Complex logic outside JSX is more readable and testable.

## Form Handling Patterns

### Controlled Components

**Use state to control form inputs:**

```tsx
function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm({ email, message });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send</button>
    </form>
  );
}
```

**Why:** Controlled components give React full control over form state, enabling validation and dynamic behavior.

### Form Validation

**Validate on submit and show errors:**

```tsx
function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!email.includes("@")) {
      setError("Invalid email address");
      return;
    }

    setError(null);
    submitLogin(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? "email-error" : undefined}
      />
      {error && (
        <span id="email-error" role="alert">
          {error}
        </span>
      )}
      <button type="submit">Login</button>
    </form>
  );
}
```

**Why:** Client-side validation improves UX by providing immediate feedback.

## Conditional Rendering

### Boolean Conditions

**Use && for simple conditional rendering:**

```tsx
// Good - simple condition
function Component({ showError, error }: Props) {
  return (
    <div>
      {showError && <ErrorMessage message={error} />}
    </div>
  );
}

// Careful - 0 renders "0"
function Component({ count }: { count: number }) {
  // Bad - renders "0" when count is 0
  return <div>{count && <Badge count={count} />}</div>;

  // Good - explicit boolean
  return <div>{count > 0 && <Badge count={count} />}</div>;
}
```

### Ternary Operators

**Use ternary for if-else rendering:**

```tsx
function Component({ isLoading, data }: Props) {
  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <DataDisplay data={data} />
      )}
    </div>
  );
}
```

### Early Returns

**Return early for cleaner code:**

```tsx
// Good - early returns
function UserProfile({ user }: { user: User | null }) {
  if (!user) {
    return <div>Please log in</div>;
  }

  if (user.isBlocked) {
    return <div>Account suspended</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}

// Bad - nested ternaries
function UserProfile({ user }: { user: User | null }) {
  return user ? (
    user.isBlocked ? (
      <div>Account suspended</div>
    ) : (
      <div>
        <h1>{user.name}</h1>
        <p>{user.bio}</p>
      </div>
    )
  ) : (
    <div>Please log in</div>
  );
}
```

**Why:** Early returns are more readable than deeply nested conditions.

## Error Boundary Patterns

### Class-Based Error Boundary

**Use class components for error boundaries:**

Example from `/home/user/tiler2-ui/src/shared/components/error-boundary/global-error-boundary.tsx`:

```tsx
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
    this.setState({ error, errorInfo });

    // Log to error tracking service
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

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

**Why:** Error boundaries require class components (no hooks equivalent yet).

### Error Boundary Fallback UI

**Provide helpful fallback UI:**

```tsx
const DefaultErrorFallback: React.FC<{
  error: Error;
  retry: () => void;
}> = ({ error, retry }) => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Oops! Something went wrong</h1>
        <p className="mb-6 text-gray-600">Please try again.</p>

        {/* Show error in development */}
        {import.meta.env.MODE === "development" && (
          <pre className="mt-2 text-xs">{error.message}</pre>
        )}

        <button onClick={retry}>Try Again</button>
      </div>
    </div>
  );
};
```

**Why:** Good fallback UI maintains user experience even when errors occur.

## Best Practices

### Component Naming

```tsx
// Good - descriptive names
export const ThreadActionsMenu = () => { /* ... */ };
export const DeleteThreadConfirmDialog = () => { /* ... */ };
export const ChatInputComponent = () => { /* ... */ };

// Bad - vague names
export const Menu = () => { /* ... */ };
export const Dialog = () => { /* ... */ };
export const Input = () => { /* ... */ };
```

### Props Destructuring

```tsx
// Good - destructure props
export const Button = ({ onClick, children, variant }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};

// Bad - accessing via props object
export const Button = (props: ButtonProps) => {
  return <button onClick={props.onClick}>{props.children}</button>;
};
```

### Fragment Usage

```tsx
// Good - short syntax
return (
  <>
    <Header />
    <Main />
  </>
);

// Good - with key
return (
  <React.Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.description}</dd>
  </React.Fragment>
);
```

## Anti-Patterns to Avoid

### Don't Mutate State Directly

```tsx
// Bad - direct mutation
const [items, setItems] = useState([1, 2, 3]);
items.push(4); // Don't do this!
setItems(items);

// Good - create new array
setItems([...items, 4]);
```

### Don't Use Index as Key

```tsx
// Bad - index as key
{items.map((item, index) => (
  <div key={index}>{item}</div>
))}

// Good - stable unique identifier
{items.map((item) => (
  <div key={item.id}>{item}</div>
))}
```

### Don't Call Hooks Conditionally

```tsx
// Bad - conditional hook
function Component({ isEnabled }: Props) {
  if (isEnabled) {
    const [value, setValue] = useState(""); // Breaks rules of hooks!
  }
  return <div>Content</div>;
}

// Good - hook at top level
function Component({ isEnabled }: Props) {
  const [value, setValue] = useState("");

  if (!isEnabled) {
    return <div>Disabled</div>;
  }

  return <div>{value}</div>;
}
```

### Don't Create Components Inside Components

```tsx
// Bad - creates new component on every render
function Parent() {
  const Child = () => <div>Child</div>;
  return <Child />;
}

// Good - component defined outside
const Child = () => <div>Child</div>;

function Parent() {
  return <Child />;
}
```

### Don't Forget Cleanup

```tsx
// Bad - no cleanup
useEffect(() => {
  const interval = setInterval(() => {
    console.log("tick");
  }, 1000);
}, []);

// Good - cleanup
useEffect(() => {
  const interval = setInterval(() => {
    console.log("tick");
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

## Next Steps

Continue to **[22-performance.md](/home/user/tiler2-ui/docs/22-performance.md)** to learn about performance optimization strategies and bundle size management.

---

**Related Documentation:**
- [20-coding-conventions.md](/home/user/tiler2-ui/docs/20-coding-conventions.md) - TypeScript conventions
- [06-state-management.md](/home/user/tiler2-ui/docs/06-state-management.md) - State management patterns
- [19-component-library.md](/home/user/tiler2-ui/docs/19-component-library.md) - UI component library

**Key Files:**
- `/home/user/tiler2-ui/src/shared/components/ui/` - Reusable UI components
- `/home/user/tiler2-ui/src/features/*/hooks/` - Custom hooks per feature
- `/home/user/tiler2-ui/src/shared/hooks/` - Shared hooks
