# Project Structure

This document provides a detailed breakdown of the project's directory structure, naming conventions, and organizational patterns.

## Table of Contents

- [Directory Overview](#directory-overview)
- [Application Layer (`/src/app`)](#application-layer-srcapp)
- [Feature Modules (`/src/features`)](#feature-modules-srcfeatures)
- [Core Infrastructure (`/src/core`)](#core-infrastructure-srccore)
- [Shared Utilities (`/src/shared`)](#shared-utilities-srcshared)
- [Root Configuration](#root-configuration)
- [Feature Module Pattern](#feature-module-pattern)
- [Naming Conventions](#naming-conventions)
- [Import Aliases](#import-aliases)
- [Co-location Principles](#co-location-principles)

## Directory Overview

```
tiler2-ui/
├── src/                          # Source code
│   ├── app/                      # Application pages and layouts
│   ├── features/                 # Feature modules (self-contained)
│   ├── core/                     # Core infrastructure
│   ├── shared/                   # Shared utilities
│   ├── main.tsx                  # Application entry point
│   ├── App.tsx                   # Root component with routing
│   ├── env.ts                    # Environment variable validation
│   └── vite-env.d.ts            # Vite type definitions
├── docs/                         # Documentation
├── public/                       # Static assets
├── .env.example                  # Environment template
├── package.json                  # Dependencies and scripts
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── vercel.json                  # Vercel deployment config
```

**WHY this structure:**
- **Separation of concerns**: Clear boundaries between layers
- **Feature isolation**: Features are self-contained modules
- **Discoverability**: Predictable locations for different code types
- **Scalability**: New features follow established patterns

## Application Layer (`/src/app`)

The `app/` directory contains **page components** and **layout components** that compose the application structure.

```
src/app/
├── page.tsx                      # Home page (threads/chat)
├── workflows/
│   └── page.tsx                  # Workflows selection page
├── app-layout.tsx                # Application layout wrapper
├── app-providers.tsx             # Global providers setup
└── globals.css                   # Global styles
```

### Key Files

#### `/src/app/page.tsx` - Home Page

The default route (`/`) that renders the main chat interface:

```typescript
export default function ThreadsPage(): React.ReactNode {
  return (
    <ArtifactProvider>
      <ThreadWithWorkflowHandler />
    </ArtifactProvider>
  );
}
```

**Responsibilities**:
- Render Thread component
- Handle workflow parameter initialization
- Provide artifact context

#### `/src/app/workflows/page.tsx` - Workflows Page

The workflows selection route (`/workflows`):

```typescript
export default function WorkflowsPage(): React.ReactNode {
  // Fetch workflows from API
  // Display categorized workflow cards
  // Handle workflow selection
}
```

**Responsibilities**:
- Fetch workflows from backend
- Display workflow catalog
- Navigate to home with workflow parameter

#### `/src/app/app-layout.tsx` - Layout Wrapper

Provides the common layout structure for all pages:

```typescript
export function AppLayout({ children }: AppLayoutProps): React.ReactNode {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<LoadingScreen />}>
        <AppProviders>
          <AppLayoutContent>{children}</AppLayoutContent>
        </AppProviders>
      </React.Suspense>
    </ErrorBoundary>
  );
}
```

**Responsibilities**:
- Error boundary protection
- Suspense fallback
- Global providers
- Sidebar layout

#### `/src/app/app-providers.tsx` - Provider Composition

Composes all application-level React Context providers:

```typescript
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      <Toaster />
      <UIProvider value={uiContextValue}>
        <HotkeysProvider>
          <ThreadProvider>
            <StreamProvider>{children}</StreamProvider>
          </ThreadProvider>
        </HotkeysProvider>
      </UIProvider>
    </>
  );
}
```

**WHY separate app providers:**
- **Composition**: Providers can be reordered or conditionally rendered
- **Testing**: Can test with subset of providers
- **Clarity**: Clear provider hierarchy

## Feature Modules (`/src/features`)

Features are **self-contained modules** with all related code co-located.

```
src/features/
├── auth/                         # Authentication
├── chat/                         # Chat UI and interactions
├── thread/                       # Thread management
├── artifacts/                    # Artifact viewer
├── side-panel/                   # Navigation sidebar
├── file-upload/                  # File upload handling
└── hotkeys/                      # Keyboard shortcuts
```

### Feature: `auth/`

Handles authentication with Auth0:

```
features/auth/
├── components/
│   ├── components/
│   │   ├── user-dropdown.tsx     # User menu dropdown
│   │   └── user-avatar.tsx       # User avatar component
│   ├── sidebar-user-profile.tsx  # Sidebar user section
│   └── index.ts                  # Public exports
├── hooks/
│   └── use-access-token.ts       # Token management hook
├── services/
│   ├── auth0.ts                  # Auth0 SDK wrapper
│   ├── auth0-client.tsx          # Client initialization
│   └── auth0-config.ts           # Auth0 configuration
├── utils/
│   ├── token-utils.ts            # Token helpers
│   └── token-error-handler.ts    # Error handling
├── types/
│   └── index.ts                  # Type definitions
├── config/
│   └── token-config.ts           # Token configuration
└── index.ts                      # Public exports
```

**Key responsibilities**:
- User authentication flow
- Token management and refresh
- User profile display
- Auth0 SDK integration

### Feature: `chat/`

Chat-specific UI components and state:

```
features/chat/
├── providers/
│   ├── ui-provider.tsx           # UI state context
│   └── chat-provider.tsx         # Chat state context
├── components/
│   └── empty-state.tsx           # Empty chat state
├── types/
│   └── index.ts                  # Type definitions
└── index.ts                      # Public exports
```

**Key responsibilities**:
- Chat UI state (sidebar open/closed, panel width)
- Empty state rendering
- Chat-specific providers

### Feature: `thread/`

Thread management and message display (largest feature):

```
features/thread/
├── components/
│   ├── layout/
│   │   ├── main-chat-area.tsx    # Main chat container
│   │   ├── message-list.tsx      # Message list renderer
│   │   ├── chat-footer.tsx       # Input area
│   │   └── artifact-panel.tsx    # Artifact side panel
│   ├── messages/
│   │   ├── ai/                   # AI message components
│   │   ├── human/                # Human message components
│   │   ├── tool-calls/           # Tool call display
│   │   ├── chat-interrupt/       # Interrupt handling
│   │   └── generic-interrupt/    # Generic interrupts
│   ├── markdown/
│   │   ├── index.tsx             # Markdown renderer
│   │   ├── code-header.tsx       # Code block header
│   │   └── utils/                # Markdown utilities
│   ├── multimodal-preview/
│   │   ├── components/           # File preview components
│   │   └── types.ts              # Preview types
│   ├── chat-input-components/    # Input-related components
│   ├── thread-header/            # Thread header
│   └── index.tsx                 # Main thread component
├── providers/
│   └── thread-provider.tsx       # Thread CRUD operations
├── hooks/
│   ├── use-thread-state.ts       # Thread state management
│   ├── use-thread-handlers.ts    # Event handlers
│   └── use-thread-effects.ts     # Side effects
├── services/
│   └── ensure-tool-responses.ts  # Tool response validation
├── utils/
│   ├── generate-thread-name.ts   # Auto-naming
│   └── build-optimistic-thread.ts # Optimistic updates
├── types/
│   └── index.ts                  # Type definitions
└── index.ts                      # Public exports
```

**Key responsibilities**:
- Message rendering (AI, human, tool calls)
- Thread CRUD operations
- Message submission and streaming
- Markdown and code rendering
- File attachment previews
- Interrupt handling

### Feature: `artifacts/`

Artifact display in side panel:

```
features/artifacts/
├── components/
│   ├── components/
│   │   ├── artifact-provider.tsx # Artifact context
│   │   ├── artifact-slot.tsx     # Artifact container
│   │   ├── artifact-content.tsx  # Content renderer
│   │   └── artifact-title.tsx    # Title bar
│   ├── hooks/
│   │   ├── use-artifact.tsx      # Artifact management
│   │   └── use-artifact-context.tsx # Context hook
│   ├── context.ts                # Context definition
│   ├── types.ts                  # Type definitions
│   └── index.tsx                 # Public exports
└── index.ts                      # Public exports
```

**Key responsibilities**:
- Artifact display in side panel
- Artifact state management
- Artifact content rendering

### Feature: `side-panel/`

Navigation sidebar and thread history:

```
features/side-panel/
├── components/
│   ├── thread-history/
│   │   ├── index.tsx             # Thread list
│   │   ├── hooks/                # History hooks
│   │   └── utils/                # Text extraction
│   ├── dialogs/
│   │   ├── rename-thread-dialog.tsx
│   │   └── delete-thread-confirm-dialog.tsx
│   ├── new-sidebar.tsx           # Main sidebar
│   ├── side-panel-layout.tsx     # Panel layout
│   ├── side-panel-header.tsx     # Panel header
│   ├── side-panel-content.tsx    # Panel content
│   ├── side-panel-navigation.tsx # Navigation items
│   ├── mobile-header.tsx         # Mobile header
│   └── index.tsx                 # Public exports
├── constants.ts                  # Panel constants
└── index.ts                      # Public exports
```

**Key responsibilities**:
- Thread history display
- Navigation between pages
- Thread management (rename, delete)
- Mobile responsive behavior

### Feature: `file-upload/`

Multimodal file upload handling:

```
features/file-upload/
├── hooks/
│   ├── use-file-upload.tsx       # Main upload hook
│   ├── file-handlers.ts          # File processing
│   ├── file-processor.ts         # File conversion
│   ├── drag-drop-handlers.ts     # Drag/drop support
│   ├── validation.ts             # File validation
│   └── constants.ts              # Upload constants
├── services/
│   └── multimodal-utils.ts       # Base64 encoding
├── types/
│   └── index.ts                  # Type definitions
└── index.ts                      # Public exports
```

**Key responsibilities**:
- File drag-and-drop
- File validation
- Base64 encoding
- Preview generation
- Paste support

### Feature: `hotkeys/`

Keyboard shortcut management:

```
features/hotkeys/
├── hotkeys-provider.tsx          # Hotkeys context
└── index.ts                      # Public exports
```

**Key responsibilities**:
- Global keyboard shortcuts
- Hotkey registration
- Keyboard event handling

## Core Infrastructure (`/src/core`)

Core infrastructure shared across features:

```
src/core/
├── components/
│   └── navigation.tsx            # Navigation component
├── config/
│   ├── index.ts                  # Config exports
│   ├── client.ts                 # Client configuration
│   └── app.ts                    # App configuration
├── providers/
│   ├── stream/
│   │   ├── stream-session.tsx    # Stream session manager
│   │   ├── stream-context.ts     # Stream context
│   │   ├── types.ts              # Stream types
│   │   └── utils.ts              # Stream utilities
│   ├── stream.tsx                # Stream provider wrapper
│   ├── network-status-provider.tsx
│   ├── motion-config-provider.tsx
│   └── sentry-user-context.tsx
├── routing/
│   ├── hooks/
│   │   ├── use-search-params-state.ts # URL state hook
│   │   └── index.ts              # Hook exports
│   ├── routes.ts                 # Route constants
│   ├── search-params.ts          # Search param schema
│   ├── utils.ts                  # Routing utilities
│   └── index.ts                  # Public exports
├── services/
│   ├── observability/
│   │   ├── client.ts             # Observability client
│   │   ├── hook.ts               # useObservability hook
│   │   ├── filters.ts            # Log filters
│   │   ├── types.ts              # Types
│   │   └── index.ts              # Public exports
│   ├── http-client.ts            # Authenticated fetch
│   ├── navigation.ts             # Navigation service
│   ├── error-display.ts          # Error display
│   ├── csp.ts                    # Content Security Policy
│   └── index.ts                  # Public exports
└── index.ts                      # Core exports
```

### Key Directories

#### `/src/core/config/` - Configuration

Centralized configuration management:

```typescript
// /home/user/tiler2-ui/src/core/config/client.ts
export interface ClientConfig {
  apiUrl: string;        // LangGraph API base URL
  assistantId: string;   // Graph/Assistant ID
}

export function getClientConfig(): ClientConfig {
  return {
    apiUrl: env.API_URL || 'http://localhost:2024',
    assistantId: env.ASSISTANT_ID || 'assistant',
  };
}
```

#### `/src/core/providers/` - Global Providers

Application-wide context providers:

- **StreamProvider**: LangGraph SDK streaming
- **NetworkStatusProvider**: Connection monitoring
- **MotionConfigProvider**: Framer Motion config
- **SentryUserContext**: Error tracking context

#### `/src/core/routing/` - Routing Infrastructure

Routing utilities and hooks:

- **routes.ts**: Route constants (`/`, `/workflows`)
- **search-params.ts**: URL parameter schema (Zod)
- **use-search-params-state.ts**: URL state management hook
- **utils.ts**: Routing helper functions

#### `/src/core/services/` - Shared Services

Cross-cutting services:

- **http-client.ts**: Authenticated fetch wrapper
- **navigation.ts**: Type-safe navigation service
- **observability/**: Logging and monitoring
- **error-display.ts**: Error notification

## Shared Utilities (`/src/shared`)

Reusable utilities shared across features:

```
src/shared/
├── components/
│   ├── ui/                       # Radix UI components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   └── ... (20+ components)
│   ├── error-boundary/
│   │   ├── global-error-boundary.tsx
│   │   ├── async-error-boundary.tsx
│   │   ├── stream-error-boundary.tsx
│   │   └── component-error-boundary.tsx
│   ├── layout/
│   │   └── page-container.tsx
│   ├── icons/
│   │   └── link.tsx
│   └── loading-spinner.tsx
├── hooks/
│   ├── use-media-query.tsx       # Responsive breakpoints
│   ├── use-mobile.ts             # Mobile detection
│   └── use-text-overflow.ts      # Text overflow detection
├── types/
│   └── index.ts                  # Shared type definitions
├── utils/
│   ├── utils.ts                  # General utilities (cn, etc.)
│   ├── validation.ts             # Validation helpers
│   └── retry.ts                  # Retry logic
└── index.ts                      # Public exports
```

### Key Directories

#### `/src/shared/components/ui/` - UI Components

Styled Radix UI components using Tailwind:

```typescript
// Example: Button component
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        outline: "border border-input...",
        ghost: "hover:bg-accent...",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
);

export function Button({ variant, size, ... }) { ... }
```

**WHY Radix UI:**
- **Accessibility**: ARIA compliant
- **Unstyled**: Full control over styling
- **Composable**: Build complex components
- **TypeScript**: Full type support

#### `/src/shared/components/error-boundary/` - Error Boundaries

Multiple error boundaries for different scopes:

- **GlobalErrorBoundary**: Top-level app errors
- **AsyncErrorBoundary**: Async operation errors
- **StreamErrorBoundary**: Streaming-specific errors
- **ComponentErrorBoundary**: Component-level errors

#### `/src/shared/hooks/` - Custom Hooks

Reusable React hooks:

```typescript
// Example: useMediaQuery
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
```

## Root Configuration

Configuration files in the project root:

```
tiler2-ui/
├── .env.example                  # Environment template
├── package.json                  # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite build config
├── tailwind.config.ts           # Tailwind CSS config
├── postcss.config.js            # PostCSS config
├── eslint.config.js             # ESLint rules
├── prettier.config.js           # Prettier formatting
└── vercel.json                  # Vercel deployment
```

### Key Configuration Files

#### `package.json` - Dependencies

```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-router-dom": "^7.1.3",
    "@langchain/langgraph-sdk": "^1.0.0",
    "@auth0/auth0-react": "^2.3.1",
    // ... 30+ dependencies
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write ."
  }
}
```

#### `tsconfig.json` - TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/core/*": ["./src/core/*"]
    }
  }
}
```

#### `vite.config.ts` - Build Configuration

```typescript
export default defineConfig({
  plugins: [react(), visualizer(), sentryVitePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/core": path.resolve(__dirname, "./src/core"),
    },
  },
  build: {
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

## Feature Module Pattern

Each feature follows a consistent internal structure:

```
features/[feature-name]/
├── components/           # UI components
│   ├── [sub-components]/ # Nested components
│   └── index.tsx         # Main component
├── hooks/                # Custom hooks
│   └── use-[feature].ts
├── providers/            # Context providers
│   └── [feature]-provider.tsx
├── services/             # Business logic
│   └── [feature]-service.ts
├── utils/                # Utility functions
│   └── [feature]-utils.ts
├── types/                # Type definitions
│   └── index.ts
├── constants.ts          # Constants
└── index.ts              # Public exports
```

### Example: Feature Export Pattern

```typescript
// features/auth/index.ts - Public API
export { useAuth } from './hooks/use-auth';
export { AuthProvider } from './providers/auth-provider';
export { UserDropdown, UserAvatar } from './components';
export type { AuthUser, AuthState } from './types';

// Internal details NOT exported
// - utils/token-utils.ts
// - services/auth0-client.ts
```

**WHY this pattern:**
- **Encapsulation**: Internal implementation hidden
- **Clear API**: Only export what's needed
- **Discoverability**: Predictable structure
- **Testability**: Easy to mock and test

## Naming Conventions

### Files

- **Components**: `kebab-case.tsx` (e.g., `user-dropdown.tsx`)
- **Hooks**: `use-[name].ts` (e.g., `use-auth.ts`)
- **Providers**: `[name]-provider.tsx` (e.g., `auth-provider.tsx`)
- **Services**: `[name]-service.ts` (e.g., `http-client.ts`)
- **Utils**: `[name]-utils.ts` (e.g., `token-utils.ts`)
- **Types**: `index.ts` or `types.ts`
- **Constants**: `constants.ts`
- **Index**: `index.ts` or `index.tsx`

### Components

- **PascalCase**: `UserDropdown`, `ChatInput`
- **Descriptive**: `RenameThreadDialog` not `Dialog`
- **Prefixed**: `use-` for hooks, `-provider` for providers

### Functions

- **camelCase**: `getUserProfile`, `handleSubmit`
- **Descriptive**: `generateThreadName` not `generate`
- **Prefixed**: `get-`, `set-`, `handle-`, `is-`, `has-`

### Types

- **PascalCase**: `AuthUser`, `ThreadState`
- **Suffixed**: `Props`, `Config`, `Options`
- **Descriptive**: `SearchParams` not `Params`

## Import Aliases

Configured in both TypeScript and Vite:

```typescript
// Use absolute imports with aliases
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth';
import { getClientConfig } from '@/core/config';

// NOT relative imports
import { Button } from '../../../shared/components/ui/button';
```

**Configured aliases:**
- `@/` → `/home/user/tiler2-ui/src/`
- `@/features/` → `/home/user/tiler2-ui/src/features/`
- `@/shared/` → `/home/user/tiler2-ui/src/shared/`
- `@/core/` → `/home/user/tiler2-ui/src/core/`

**WHY aliases:**
- **Clarity**: Obvious where imports come from
- **Refactoring**: Moving files doesn't break imports
- **Consistency**: Same import path regardless of file location

## Co-location Principles

### 1. Keep Related Code Together

```
✅ GOOD: Feature-specific code lives in feature
features/auth/
├── components/user-dropdown.tsx
├── hooks/use-auth.ts
└── types/index.ts

❌ BAD: Scattering feature code across layers
components/user-dropdown.tsx
hooks/use-auth.ts
types/auth-types.ts
```

### 2. Nested Components

```
✅ GOOD: Sub-components near parent
features/thread/components/
├── messages/
│   ├── ai/
│   │   ├── message-content.tsx
│   │   └── sources-list.tsx
│   └── human/
│       └── index.tsx

❌ BAD: All components flat
features/thread/components/
├── ai-message-content.tsx
├── ai-sources-list.tsx
└── human-message.tsx
```

### 3. Test Files

```
✅ GOOD: Tests next to implementation
features/auth/
├── hooks/
│   ├── use-auth.ts
│   └── use-auth.test.ts

❌ BAD: Separate test directories
features/auth/hooks/use-auth.ts
tests/auth/hooks/use-auth.test.ts
```

### 4. Shared vs Feature

```
✅ Shared: Used by 3+ features
shared/hooks/use-media-query.ts

✅ Feature: Used by 1-2 components in feature
features/auth/hooks/use-token-refresh.ts

❌ BAD: Everything in shared
shared/hooks/use-thread-name.ts  # Should be in features/thread/
```

**WHY co-location:**
- **Discoverability**: Related code is adjacent
- **Cohesion**: Changes affect nearby files
- **Ownership**: Clear feature boundaries
- **Deletion**: Easy to remove entire features

---

**Next**: [06-state-management.md](./06-state-management.md) - Comprehensive state management patterns and practices.
