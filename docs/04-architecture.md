# Architecture Overview

This document describes the high-level architecture of the Tiler2 UI application, explaining the key patterns, decisions, and rationale behind the system design.

## Table of Contents

- [Overall Architecture Pattern](#overall-architecture-pattern)
- [Frontend Architecture](#frontend-architecture)
- [Backend/API Architecture](#backendapi-architecture)
- [Communication Patterns](#communication-patterns)
- [Data Flow](#data-flow)
- [Authentication Architecture](#authentication-architecture)
- [File Upload Architecture](#file-upload-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Key Architectural Decisions](#key-architectural-decisions)

## Overall Architecture Pattern

The application follows a **client-server architecture with streaming capabilities**:

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │         React Application (Vite)                 │   │
│  │  ┌──────────────────────────────────────────┐   │   │
│  │  │  Feature Modules (Auth, Chat, Thread)   │   │   │
│  │  │  Core Infrastructure (Routing, Config)   │   │   │
│  │  │  Shared Components & Utilities           │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        │
                        │ HTTPS + Auth0 Token
                        │ REST API + SSE
                        ▼
┌─────────────────────────────────────────────────────────┐
│              LangGraph External API                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Assistants (Graph Definitions)                  │   │
│  │  Threads (Conversation State)                    │   │
│  │  Runs (Streaming Execution)                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        │
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Auth0 Service                          │
│  (OAuth2 Authentication & Authorization)                 │
└─────────────────────────────────────────────────────────┘
```

**WHY this pattern:**
- **Separation of concerns**: UI logic separate from business logic
- **Streaming**: Real-time updates during long-running AI operations
- **Stateless client**: All conversation state managed server-side
- **Scalability**: Client and API can scale independently

## Frontend Architecture

### Technology Stack

- **React 19**: UI framework with concurrent features
- **TypeScript**: Type safety across the codebase
- **Vite**: Fast build tool and dev server
- **React Router v7**: Client-side routing with URL-based state
- **TailwindCSS v4**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animations and transitions

### Feature-Based Organization

The frontend uses a **feature-based architecture** instead of technical layers:

```
src/
├── app/              # Application pages and layouts
│   ├── page.tsx      # Home/threads page
│   └── workflows/    # Workflows page
├── features/         # Feature modules (self-contained)
│   ├── auth/         # Authentication
│   ├── chat/         # Chat UI and interactions
│   ├── thread/       # Thread management and display
│   ├── artifacts/    # Artifact viewer
│   ├── side-panel/   # Navigation and history
│   ├── file-upload/  # Multimodal file handling
│   └── hotkeys/      # Keyboard shortcuts
├── core/             # Core infrastructure
│   ├── config/       # Configuration management
│   ├── providers/    # Global providers (Stream, Network)
│   ├── routing/      # Routing utilities and hooks
│   └── services/     # Shared services (HTTP, observability)
└── shared/           # Shared utilities
    ├── components/   # Reusable UI components
    ├── hooks/        # Custom React hooks
    ├── types/        # Shared TypeScript types
    └── utils/        # Utility functions
```

**WHY feature-based:**
- **Colocation**: Related code lives together
- **Discoverability**: Easy to find feature-specific code
- **Modularity**: Features can be modified independently
- **Scalability**: New features don't clutter existing structure

### Component Hierarchy

```
main.tsx (entry point)
└── App.tsx
    ├── MotionConfigProvider (animations)
    ├── GlobalErrorBoundary (error handling)
    ├── AsyncErrorBoundary (async error handling)
    ├── NetworkStatusProvider (connection monitoring)
    ├── SentryUserContext (observability)
    └── Routes
        ├── ProtectedRoute (auth wrapper)
        │   └── AppLayout
        │       ├── AppProviders (feature contexts)
        │       │   ├── UIProvider (UI state)
        │       │   ├── HotkeysProvider (keyboard shortcuts)
        │       │   ├── ThreadProvider (thread CRUD)
        │       │   └── StreamProvider (LangGraph streaming)
        │       └── Page Components
        │           ├── ThreadsPage (/)
        │           └── WorkflowsPage (/workflows)
        └── CallbackPage (/auth/callback)
```

**WHY this hierarchy:**
- **Progressive enhancement**: Providers wrap increasingly specific functionality
- **Error boundaries**: Catch errors at appropriate levels
- **Authentication gate**: Protected routes enforce auth before rendering
- **Context isolation**: Each provider manages a specific domain

## Backend/API Architecture

The application consumes the **LangGraph External API**, which provides:

### API Endpoints

```typescript
// Thread Management
POST   /threads/search          # Search threads by metadata
GET    /threads/{thread_id}     # Get thread details
DELETE /threads/{thread_id}     # Delete thread
PATCH  /threads/{thread_id}     # Update thread metadata

// Streaming Execution
POST   /runs/stream             # Submit input and stream results

// Workflows
GET    /workflows               # Get available workflows
```

### Graph Configuration

Configuration is provided via environment variables:

```typescript
// /home/user/tiler2-ui/src/core/config/client.ts
export interface ClientConfig {
  apiUrl: string;        // LangGraph API base URL
  assistantId: string;   // Graph/Assistant identifier
}
```

**WHY LangGraph SDK:**
- **Streaming support**: Built-in SSE handling
- **State management**: Server-side conversation state
- **Type safety**: TypeScript SDK with full types
- **Interrupt handling**: Support for human-in-the-loop patterns

## Communication Patterns

### REST + Server-Sent Events (SSE)

The application uses a hybrid approach:

1. **REST API**: For CRUD operations (threads, workflows)
2. **SSE Streaming**: For real-time AI responses

```typescript
// Example: StreamSession component
// /home/user/tiler2-ui/src/core/providers/stream/stream-session.tsx

const streamValue = useTypedStream({
  apiUrl,
  assistantId,
  threadId,
  timeoutMs: 15000,
  defaultHeaders: {
    Authorization: `Bearer ${accessToken}`,
  },
  // Event handlers
  onMetadataEvent: (data) => { /* handle metadata */ },
  onCustomEvent: (event) => { /* handle custom events */ },
  onError: (error) => { /* handle errors */ },
  onThreadId: (id) => { /* handle thread creation */ },
});
```

### Authentication Headers

All API requests include an OAuth2 Bearer token:

```typescript
// /home/user/tiler2-ui/src/core/services/http-client.ts
const response = await fetch(url, {
  ...options,
  headers: {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
  },
});
```

**WHY this pattern:**
- **Real-time updates**: SSE provides instant feedback during streaming
- **Simplicity**: No WebSocket complexity
- **Compatibility**: Works with existing HTTP infrastructure
- **Security**: Token-based auth on every request

## Data Flow

### New Conversation Flow

```
User clicks workflow → WorkflowsPage
                          │
                          ├─ Fetch workflow metadata (REST)
                          ├─ Generate optimistic thread
                          ├─ Add to UI immediately (optimistic update)
                          └─ Submit to StreamProvider
                                    │
                                    ├─ Create thread (SSE)
                                    ├─ Execute graph (SSE)
                                    ├─ Stream events (SSE)
                                    │   ├─ Metadata events
                                    │   ├─ Custom events
                                    │   └─ State updates
                                    └─ Verify thread creation (REST)
                                          │
                                          └─ Update thread list
```

### Message Flow

```
User types message → ChatInput
                        │
                        └─ Submit handler
                              │
                              ├─ Build message with attachments
                              ├─ Update URL state (threadId)
                              └─ StreamProvider.submit()
                                    │
                                    ├─ POST to /runs/stream
                                    ├─ Receive SSE events
                                    │   ├─ messages/partial
                                    │   ├─ messages/complete
                                    │   ├─ ui events
                                    │   └─ metadata
                                    └─ Update React state
                                          │
                                          └─ Re-render Thread component
```

### State Update Flow

```
URL Parameter Change → useSearchParamState
                            │
                            ├─ Parse parameter
                            ├─ Update local state
                            └─ Trigger dependent effects
                                  │
                                  └─ StreamProvider re-initializes
                                        │
                                        ├─ Fetch history (if threadId)
                                        └─ Update stream context
```

**WHY this flow:**
- **URL as source of truth**: Enables deep linking and browser history
- **Optimistic updates**: Instant UI feedback
- **Server-side state**: Conversations persist across sessions
- **Event-driven**: React to streaming events incrementally

## Authentication Architecture

### Auth0 OAuth2 Flow

```
User visits app → Check authentication status
                      │
                      ├─ Not authenticated
                      │    └─ Redirect to Auth0 login
                      │          │
                      │          └─ User authenticates
                      │                │
                      │                └─ Redirect to /auth/callback
                      │                      │
                      │                      └─ Exchange code for token
                      │                            │
                      │                            └─ Store in localStorage
                      │
                      └─ Authenticated
                           └─ Render protected routes
```

### Token Management

```typescript
// /home/user/tiler2-ui/src/main.tsx
<Auth0Provider
  domain={env.AUTH0_DOMAIN}
  clientId={env.AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: `${window.location.origin}/auth/callback`,
    audience: env.AUTH0_AUDIENCE,
  }}
  useRefreshTokens={true}          // Automatic token refresh
  cacheLocation="localstorage"      // Persist across sessions
>
```

### Protected Routes

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

  if (!isAuthenticated) return <LoadingScreen />;
  return <>{children}</>;
}
```

**WHY Auth0:**
- **Security**: Industry-standard OAuth2/OIDC implementation
- **Token management**: Automatic refresh and caching
- **User management**: Handled outside application code
- **SSO support**: Enterprise authentication options

## File Upload Architecture

### Client-Side Base64 Encoding

Files are encoded on the client and sent as base64 strings:

```typescript
// /home/user/tiler2-ui/src/features/file-upload/services/multimodal-utils.ts
export const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const [, base64] = result.split(',');
      resolve(base64 ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const fileToContentBlock = async (
  file: File,
): Promise<MultimodalContentBlock> => {
  const data = await fileToBase64(file);

  if (file.type.startsWith('image/')) {
    return {
      type: 'image',
      mimeType: file.type,
      data,
    };
  }

  return {
    type: 'file',
    mimeType: 'application/pdf',
    data,
    source_type: 'base64',
  };
};
```

### Supported File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Documents**: PDF

**WHY client-side encoding:**
- **Simplicity**: No file upload infrastructure needed
- **Security**: Files never touch intermediate servers
- **Compatibility**: Standard base64 format
- **Immediate preview**: Can show preview before submission

**Trade-offs:**
- **Size limit**: Large files increase message payload
- **Memory usage**: Browser must load entire file
- **Network**: Base64 is ~33% larger than binary

## Deployment Architecture

### Vercel Hosting

The application is deployed on Vercel as a static SPA:

```json
// /home/user/tiler2-ui/vercel.json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"    // SPA routing
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Build Configuration

```typescript
// /home/user/tiler2-ui/vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true,              // For Sentry error tracking
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/*'],
          langchain: ['@langchain/*'],
        },
      },
    },
  },
});
```

**WHY Vercel:**
- **Edge deployment**: Global CDN for fast load times
- **Automatic HTTPS**: Built-in SSL certificates
- **Preview deployments**: Every PR gets a URL
- **Zero configuration**: Detects Vite automatically
- **Analytics**: Built-in performance monitoring

## Key Architectural Decisions

### 1. URL State as Primary State Source

**Decision**: Use URL search parameters for application state (threadId, chatHistoryOpen, workflow).

**Rationale**:
- **Deep linking**: Users can share exact application state
- **Browser history**: Back/forward buttons work naturally
- **Persistence**: State survives page refresh
- **Simplicity**: No need for complex state synchronization

**Implementation**: Custom `useSearchParamState` hook wraps React Router.

### 2. Feature-Based Code Organization

**Decision**: Organize code by feature, not by technical layer.

**Rationale**:
- **Cohesion**: Related code lives together
- **Scalability**: New features don't affect existing structure
- **Ownership**: Clear boundaries for team ownership
- **Discoverability**: Easier to find feature code

**Trade-off**: Some code duplication vs. cross-cutting concerns.

### 3. Optimistic Updates for Thread Operations

**Decision**: Update UI immediately, verify server-side asynchronously.

**Rationale**:
- **Perceived performance**: Instant feedback
- **Better UX**: No loading spinners for common actions
- **Error handling**: Rollback on server failure

**Implementation**: See `/home/user/tiler2-ui/src/features/thread/providers/thread-provider.tsx`

### 4. Client-Side File Encoding

**Decision**: Convert files to base64 in browser, not server upload.

**Rationale**:
- **Simplicity**: No upload infrastructure
- **Security**: Files sent directly to backend
- **Preview**: Immediate display in UI

**Trade-off**: Payload size vs. infrastructure complexity.

### 5. React Context for Cross-Cutting State

**Decision**: Use React Context for features used across multiple components.

**Rationale**:
- **Avoid prop drilling**: Clean component interfaces
- **Scoped state**: Different contexts for different concerns
- **Performance**: Selective re-renders with proper memoization

**Contexts**: UIProvider, StreamProvider, ThreadProvider, ArtifactProvider, HotkeysProvider.

### 6. Streaming Over Polling

**Decision**: Use Server-Sent Events for real-time updates.

**Rationale**:
- **Real-time**: Immediate updates during execution
- **Efficiency**: No repeated polling requests
- **Simplicity**: Easier than WebSockets
- **HTTP/2**: Multiplexing support

**Trade-off**: One-way communication (client can't send via SSE).

### 7. TypeScript Throughout

**Decision**: Strict TypeScript across entire codebase.

**Rationale**:
- **Type safety**: Catch errors at compile time
- **Developer experience**: Better IDE support
- **Documentation**: Types serve as inline documentation
- **Refactoring**: Confident large-scale changes

**Configuration**: Strict mode enabled in `tsconfig.json`.

### 8. Error Boundaries at Multiple Levels

**Decision**: Nested error boundaries for different failure scopes.

**Rationale**:
- **Graceful degradation**: Errors don't crash entire app
- **Context-aware recovery**: Different strategies for different errors
- **User experience**: Helpful error messages

**Boundaries**: GlobalErrorBoundary, AsyncErrorBoundary, StreamErrorBoundary.

---

**Next**: [05-project-structure.md](./05-project-structure.md) - Detailed breakdown of directory structure and conventions.
