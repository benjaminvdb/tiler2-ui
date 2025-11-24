# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Agent Chat UI** (branded as "Link Chat"), a Vite + React application that provides a chat interface for interacting with LangGraph servers. The application uses TypeScript, React, React Router, and LangGraph SDK to enable real-time conversations with AI agents.

## Development Commands

### Common Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Development Environment

- **Package Manager**: pnpm (required - specified in package.json)
- **Build Tool**: Vite (fast, modern development experience)
- **TypeScript**: Strict mode enabled
- **Port**: Development server runs on `http://localhost:3000`

## Code Architecture

### Core Application Structure

The application is structured by sbusiness domains/features rather than technical layers, making it more maintainable and scalable.

```
src/
├── app/                           # Application pages
│   ├── workflows/                # Workflows page
│   ├── globals.css
│   ├── app-layout.tsx            # Main layout component
│   ├── app-providers.tsx         # Global providers
│   └── page.tsx                  # Home/threads page
├── features/                      # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── chat/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── thread/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── artifacts/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   └── file-upload/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── index.ts
├── shared/                        # Shared utilities
│   ├── components/               # Reusable UI components
│   ├── hooks/                    # Generic hooks
│   ├── services/                 # Cross-feature services
│   ├── utils/                    # Pure utility functions
│   ├── types/                    # Global types
│   └── constants/
├── core/                         # Core business logic
│   ├── config/
│   ├── providers/               # Global providers
│   ├── services/               # Core services
│   └── middleware/
└── infrastructure/              # External concerns
    ├── api/
    ├── storage/
    └── monitoring/
```

### Key Architectural Patterns

1. **Provider Pattern**: Uses React Context for state management
   - `StreamProvider`: Manages LangGraph connection and streaming
   - `ThreadProvider`: Handles thread operations and history
   - `ArtifactProvider`: Manages artifact rendering in side panel

2. **Modular Components**: Thread component was recently refactored (see REFACTORING_SUMMARY.md)
   - Main component: `src/components/thread/index.tsx`
   - Extracted utilities: `scroll-utils.tsx`, `action-buttons.tsx`
   - Custom hooks: `hooks/use-thread-state.ts`, `hooks/use-thread-handlers.ts`

3. **API Access**: All requests flow directly from the browser using the LangGraph SDK client, with Auth0 tokens injected via the Auth0 React SDK before calling the configured LangGraph deployment.

### State Management

- **URL State**: Custom hooks in `core/routing` for typed query params using React Router
- **Local State**: React hooks for component-specific state
- **Global State**: Context providers (`UIProvider`, `ThreadProvider`, etc.)
- **Streaming State**: LangGraph SDK's client for streaming responses

### Routing

- **React Router v7**: Client-side routing with `BrowserRouter`
- **Routes**: Defined in `src/App.tsx`
- **Navigation**: Custom navigation service wraps React Router

### Authentication

- **Auth0**: Configured via `@auth0/auth0-react`
- **API Key**: Optional LangSmith API key for tracing/monitoring only
- **Environment Variables**: `VITE_API_URL` / `VITE_ASSISTANT_ID` set the LangGraph deployment globally (no per-user setup screen)

## Environment Configuration

### Development Setup

```bash
# Local development
VITE_API_URL=http://localhost:2024
VITE_ASSISTANT_ID=agent
VITE_APP_BASE_URL=http://localhost:3000

# Auth0 configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-audience
```

### Production Setup

```bash
# Required for production
VITE_API_URL="https://your-agent.langgraph.app"
VITE_ASSISTANT_ID="agent"
VITE_APP_BASE_URL="https://your-app.com"

# Auth0 configuration
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api-audience

# Optional: LangSmith for tracing/monitoring
LANGSMITH_API_KEY="lsv2_..."

# Optional: Sentry for error monitoring
VITE_SENTRY_DSN="https://..."
VITE_SENTRY_ENVIRONMENT="production"
```

**Important**: All `VITE_` prefixed variables are publicly accessible in the browser bundle. Never put secrets in `VITE_` variables.

## Key Features

1. **Real-time Chat**: Streaming responses from LangGraph servers
2. **Thread Management**: Persistent conversation history
3. **File Upload**: Multimodal content support
4. **Artifact Rendering**: Side panel for displaying AI-generated content
5. **Interrupt Handling**: Support for human-in-the-loop interactions
6. **Responsive Design**: Mobile and desktop optimized

## Testing and Quality

- **Linting**: ESLint with TypeScript and React hooks plugins
- **Formatting**: Prettier with Tailwind CSS plugin
- **Type Checking**: Strict TypeScript configuration
- **Build Validation**: Vite build process with TypeScript validation

## Key Dependencies

- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing (v7)
- **LangGraph SDK**: `@langchain/langgraph-sdk` for AI agent communication
- **Auth0**: `@auth0/auth0-react` for authentication
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS with custom design system
- **Sentry**: `@sentry/react` for error monitoring

## Development Guidelines

- Use consistent export patterns: named exports for components, default exports only for pages and main entry points, minimize re-export barrels.
- Use handle errors and use try/catch, not .catch()
- Use descriptive variable names
- Prioritize code readability and maintainability; avoid over-engineering and keep solutions simple.
- Organize components by feature or domain in dedicated folders (e.g., components/auth-wizard)
- Split files when it improves architecture and avoid large monolithic files
- Minimize use of useEffect and local state; prefer lifting state up and using React Context
- Annotate all props, state, and function return types; avoid any
- Use interfaces or types for component props and state
- Avoid unnecessary type assertions
- Create reusable and generic components to avoid duplication
- Limit to one useEffect per component when possible
- Avoid complex ternaries in JSX; use helper functions for conditional rendering
- Encapsulate logic in functions to reduce complexity and improve testability
- Validate all user input and API responses
- Handle errors gracefully in UI with fallback components or error boundaries
- Sanitize and validate all user input
- Avoid exposing sensitive data in the client bundle
- Define React components consistently using Arrow-FC + Return, i.e., `const Comp = (props: Props): JSX.Element => { ... }`
- Use consistent naming: kebab-case for filenames, PascalCase for component names and camelCase for variables

## Development Best Practices

- Always run 'pnpm run check' NOT 'pnpm run build' to check the code for errors, as this is much faster.
