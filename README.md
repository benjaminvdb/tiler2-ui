# Link Chat Frontend

A modern React/Next.js application providing a chat interface for interacting with LangGraph AI agents. Built for production use with Auth0 authentication, real-time streaming, and comprehensive error handling.

- **Live Demo**: [agentchat.vercel.app](https://agentchat.vercel.app)
- **Setup Guide**: [Watch the video](https://youtu.be/lInrwVnZ83o)

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/langchain-ai/agent-chat-ui.git
cd agent-chat-ui

# Install dependencies (requires pnpm)
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Local Configuration

Create a `.env` file in the project root:

```bash
# LangGraph server connection
NEXT_PUBLIC_API_URL=http://localhost:2024
NEXT_PUBLIC_ASSISTANT_ID=agent

# Auth0 configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-audience

# Optional: LangSmith tracing
LANGSMITH_API_KEY=lsv2_...
```

## Architecture

### Tech Stack

- **Framework**: React 19 with Vite (fast, modern bundling)
- **Language**: TypeScript (strict mode enabled)
- **Routing**: React Router v7 with URL-based state management
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Auth**: Auth0 for OAuth2 authentication
- **Monitoring**: Sentry for error tracking
- **AI Integration**: LangGraph SDK for streaming agent communication

### Directory Structure

```
src/
├── app/                         # Pages and layouts
│   ├── page.tsx                # Main threads page
│   ├── workflows/page.tsx      # Workflows page
│   ├── app-layout.tsx          # Root layout with sidebar
│   └── app-providers.tsx       # Feature-specific context providers
│
├── features/                    # Feature modules (domain-driven)
│   ├── auth/                   # Authentication & user management
│   ├── chat/                   # Chat UI state and providers
│   ├── thread/                 # Chat thread functionality (largest module)
│   ├── artifacts/              # Side panel artifact rendering
│   ├── side-panel/             # Sidebar & thread navigation
│   ├── file-upload/            # Multimodal file handling
│   └── hotkeys/                # Global keyboard shortcuts
│
├── core/                        # Core infrastructure
│   ├── config/                 # App configuration
│   ├── providers/              # Global React Context providers
│   ├── services/               # Core services (HTTP, error, logging)
│   ├── routing/                # Client-side routing utilities
│   └── components/             # Core UI components
│
├── shared/                      # Shared utilities and components
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # Generic React hooks
│   ├── types/                  # Global type definitions
│   └── utils/                  # Utility functions
│
└── env.ts                       # Typed environment variables
```

## Key Features

### 1. Real-Time Streaming

- Messages stream as they're generated from the AI model
- Live progress indicators for long-running operations
- Graceful handling of aborted requests

### 2. Thread Management

- Persistent conversation history
- Create, rename, delete threads
- Branch conversations with message regeneration
- Search and filter threads

### 3. Multimodal Support

- Upload images, PDFs, and other files
- Drag-and-drop file handling
- File preview in chat
- Type and size validation

### 4. Human-in-the-Loop

- Interrupt workflows for user decisions
- Resume from interrupts without losing context
- Expert help requests with context inclusion

### 5. Error Handling & Monitoring

- Comprehensive error boundaries at multiple levels
- Automatic retry with exponential backoff
- 403 Forbidden error handling with token refresh
- Sentry integration for production monitoring
- User-friendly error messages with recovery options

### 6. Authentication

- Auth0 OAuth2 integration
- Automatic token refresh
- Silent logout on permission errors
- User profile management

## Development Commands

### Code Quality

```bash
pnpm check       # Fast TypeScript check (recommended over build)
pnpm lint        # Run ESLint
pnpm lint:fix    # Fix linting issues
pnpm format      # Format code with Prettier
pnpm format:check # Check formatting without changes
```

### Development

```bash
pnpm dev         # Start dev server with HMR
pnpm build       # Build for production
pnpm start       # Run production server
pnpm preview     # Preview production build locally
```

## Environment Configuration

### Development (.env.development)

```bash
NEXT_PUBLIC_API_URL=http://localhost:2024
NEXT_PUBLIC_ASSISTANT_ID=agent
VITE_AUTH0_DOMAIN=dev-xxx.auth0.com
VITE_AUTH0_CLIENT_ID=dev-client-id
```

### Production (.env.production)

```bash
# LangGraph server (must be HTTPS)
NEXT_PUBLIC_API_URL=https://my-agent.default.us.langgraph.app
NEXT_PUBLIC_ASSISTANT_ID=agent

# Auth0 production configuration
VITE_AUTH0_DOMAIN=prod-xxx.auth0.com
VITE_AUTH0_CLIENT_ID=prod-client-id
VITE_AUTH0_AUDIENCE=https://your-api-audience

# Optional: LangSmith for tracing
LANGSMITH_API_KEY=lsv2_...

# Optional: Sentry for error monitoring
VITE_SENTRY_DSN=https://...
VITE_SENTRY_ENVIRONMENT=production
```

> **Security Note**: Only use `VITE_` prefix for public variables. Never prefix secrets with `VITE_`.

## Core Concepts

### State Management

**URL State**: Primary state using React Router search params

```typescript
const [threadId, setThreadId] = useSearchParamState("threadId");
// Automatically syncs with URL: ?threadId=uuid
```

**Context Providers**: Global state for features

- `StreamProvider`: LangGraph connection and streaming state
- `ThreadProvider`: Thread history and operations
- `UIProvider`: Chat history visibility, side panel width
- `HotkeysProvider`: Global keyboard shortcuts

### Message Flow

1. User submits message with optional files
2. Optimistic update adds message to UI immediately
3. Request sent to LangGraph server via streaming client
4. Streaming chunks render as they arrive
5. Tool calls show in special message format
6. AI response assembled from stream chunks
7. Artifacts rendered in side panel if present

### Error Handling Strategy

```typescript
// Network errors: Automatic retry with exponential backoff
// 403 Forbidden: Automatic token refresh, then retry
// 404/400: Immediate failure, user notification
// Timeout: Show retry button, auto-retry once
// Aborted: Clean up without showing error to user
```

## Features in Detail

### Message Handling

**Controlling Message Visibility** in LangGraph:

Hide streaming (but show when complete):

```python
model = ChatAnthropic().with_config({"tags": ["langsmith:nostream"]})
```

Hide permanently:

```python
result = model.invoke([messages])
result.id = f"do-not-render-{result.id}"
return {"messages": [result]}
```

### Artifact Rendering

Artifacts display in a resizable side panel. Example custom artifact:

```tsx
import { useArtifact } from "@/features/artifacts/hooks";

export function CodeBlock({ code, language }: Props) {
  const [Artifact, { setOpen }] = useArtifact();

  return (
    <>
      <button onClick={() => setOpen(true)}>View Code</button>
      <Artifact title="Code Preview">
        <pre>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </Artifact>
    </>
  );
}
```

### File Upload

Supported file types and limits:

- Images: JPEG, PNG, GIF, WebP (max 10 files, 50MB total)
- Documents: PDF (max 10 files, 50MB total)
- Validation happens client-side before upload

## Customization

### Styling

The app uses Tailwind CSS with shadcn/ui components. Customize via:

- `tailwind.config.js`: Tailwind theme and plugins
- `src/app/globals.css`: Global styles and CSS variables
- Component-level: Tailwind utility classes

### Colors & Themes

Edit CSS variables in `globals.css`:

```css
:root {
  --primary: #2563eb;
  --secondary: #7c3aed;
  --destructive: #ef4444;
}
```

### UI Components

All UI primitives from shadcn/ui are available in `src/shared/components/ui/`.

## Performance

### Best Practices

- **Code splitting**: Route-based lazy loading with React.lazy()
- **Memoization**: useMemo/useCallback for expensive operations
- **Image optimization**: Lazy loading in message lists
- **Bundle size**: ~200KB gzipped (main bundle)

### Monitoring

- **Sentry**: Automatic error tracking in production
- **Performance metrics**: Available in browser DevTools
- **Network monitoring**: Request timing in application logs

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Code style and organization standards
- Documentation requirements (JSDoc for all exports)
- Testing guidelines
- Security best practices
- Pre-commit checklist

### Key Standards

- **TypeScript**: Strict mode, no `any`
- **Documentation**: JSDoc for all exported items
- **Comments**: Focus on WHY, not WHAT
- **Components**: Named exports, single responsibility
- **State**: Prefer URL state and Context over local state

## Troubleshooting

### Common Issues

**"Cannot find Auth0 config"**

- Check `.env` file exists with `VITE_AUTH0_*` variables
- Restart dev server after changing `.env`

**"LangGraph connection refused"**

- Verify `NEXT_PUBLIC_API_URL` points to running server
- For local dev: ensure `http://localhost:2024` is accessible

**"403 Forbidden after login"**

- Auth token may be expired; try refreshing page
- Check Auth0 configuration matches LangGraph setup

**"Slow UI rendering"**

- Check for unnecessary re-renders: `<Profiler>` in React DevTools
- Verify memoization on expensive components
- Check Network tab for slow API calls

## Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph SDK (JavaScript)](https://langchain-ai.github.io/langgraphjs/)
- [Auth0 Documentation](https://auth0.com/docs)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## License

See [LICENSE](./LICENSE) file.

## Support

For issues and feature requests, please use the [GitHub issues](https://github.com/langchain-ai/agent-chat-ui/issues).
