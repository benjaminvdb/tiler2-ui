# Tiler2 UI Documentation

> A production-ready React/Vite application providing a chat interface for LangGraph AI agents focused on sustainability workflows. Built with React 19, TypeScript, Tailwind CSS, and Auth0 authentication. Features real-time streaming, multimodal support (images/PDFs), human-in-the-loop workflows, and comprehensive thread management.

## Project Overview

**Tiler2 UI** (also known as "Link Chat" or "Agent Chat UI") is a modern single-page application that enables users to interact with AI agents through a conversational interface. The application is designed specifically for sustainability professionals, providing access to AI-powered workflows for governance, impact assessment, reporting, and strategic planning.

**Tech Stack:** React 19.2.0, Vite 6.0.11, TypeScript 5.9.2, Tailwind CSS 4.1.11, Auth0 2.3.1, LangGraph SDK 1.0.0

**Architecture:** Client-server architecture with streaming communication. The frontend is a pure client-side React application that communicates with an external LangGraph API server via REST and Server-Sent Events (SSE).

**Live Demo:** https://agentchat.vercel.app

**Repository:** https://github.com/langchain-ai/agent-chat-ui

## Getting Started

- [Quick Start Guide](./docs/01-quick-start.md) - Setup, installation, and running locally
- [Configuration Guide](./docs/02-configuration.md) - Environment variables and configuration options
- [Development Workflow](./docs/03-development-workflow.md) - Development practices, scripts, and workflows

## Core Concepts

- [Architecture Overview](./docs/04-architecture.md) - System architecture, data flow, and communication patterns
- [Project Structure](./docs/05-project-structure.md) - Directory organization and file organization patterns
- [State Management](./docs/06-state-management.md) - URL state, React Context, local storage, and state synchronization
- [Routing and Navigation](./docs/07-routing.md) - React Router configuration and URL-based state

## Features

- [Chat System](./docs/08-chat-system.md) - Real-time streaming, message types, markdown rendering
- [Thread Management](./docs/09-thread-management.md) - Creating, updating, deleting, and searching threads
- [Workflow System](./docs/10-workflows.md) - Pre-configured workflows, categories, and initialization
- [Multimodal Support](./docs/11-multimodal.md) - Image and PDF uploads, file handling, base64 encoding
- [Human-in-the-Loop](./docs/12-human-in-loop.md) - Workflow interrupts, user decisions, and resume functionality
- [Artifacts Display](./docs/13-artifacts.md) - Side panel rendering for code and documents
- [Keyboard Shortcuts](./docs/14-keyboard-shortcuts.md) - Global hotkeys and navigation

## Technical Reference

- [API Integration](./docs/15-api-integration.md) - LangGraph API endpoints, request/response formats
- [Authentication](./docs/16-authentication.md) - Auth0 OAuth2 flow, token management, security
- [Error Handling](./docs/17-error-handling.md) - Error boundaries, retry logic, Sentry integration
- [Styling and Theming](./docs/18-styling-theming.md) - Tailwind configuration, design system, dark mode
- [Component Library](./docs/19-component-library.md) - shadcn/ui components, custom components, patterns

## Code Patterns

- [Coding Conventions](./docs/20-coding-conventions.md) - TypeScript patterns, naming conventions, best practices
- [React Patterns](./docs/21-react-patterns.md) - Hooks, context providers, component composition
- [Performance Optimization](./docs/22-performance.md) - Code splitting, memoization, lazy loading
- [Accessibility](./docs/23-accessibility.md) - ARIA labels, keyboard navigation, screen readers

## Deployment

- [Build Process](./docs/24-build-process.md) - Production builds, bundle optimization, source maps
- [Deployment Guide](./docs/25-deployment.md) - Vercel deployment, CI/CD pipeline, environment management
- [Monitoring and Observability](./docs/26-monitoring.md) - Sentry error tracking, performance monitoring

## Feature Modules

- [Auth Module](./docs/27-module-auth.md) - Authentication feature implementation
- [Chat Module](./docs/28-module-chat.md) - Chat feature implementation
- [Thread Module](./docs/29-module-thread.md) - Thread management feature implementation
- [Artifacts Module](./docs/30-module-artifacts.md) - Artifacts feature implementation
- [Side Panel Module](./docs/31-module-side-panel.md) - Navigation and sidebar feature implementation
- [File Upload Module](./docs/32-module-file-upload.md) - File upload feature implementation
- [Hotkeys Module](./docs/33-module-hotkeys.md) - Keyboard shortcuts feature implementation

## Data Models

- [Type Definitions](./docs/34-type-definitions.md) - TypeScript interfaces and types
- [Message Format](./docs/35-message-format.md) - Message structure, content blocks, tool calls
- [Thread Schema](./docs/36-thread-schema.md) - Thread data structure and metadata

## Development

- [Testing Strategy](./docs/37-testing-strategy.md) - Testing approach and recommendations
- [Code Quality Tools](./docs/38-code-quality.md) - ESLint, Prettier, TypeScript, Knip
- [Debugging Guide](./docs/39-debugging.md) - Debugging tools, techniques, and common issues
- [Contributing Guidelines](./docs/40-contributing.md) - How to contribute to the project

## Security

- [Security Best Practices](./docs/41-security.md) - Security headers, authentication, input validation
- [Environment Variables](./docs/42-environment-variables.md) - Secrets management and configuration

## Troubleshooting

- [Common Issues](./docs/43-common-issues.md) - Frequently encountered problems and solutions
- [FAQ](./docs/44-faq.md) - Frequently asked questions

## Anti-Patterns

- [What NOT to Do](./docs/45-anti-patterns.md) - Common mistakes and deprecated patterns to avoid

## Additional Resources

- [External Dependencies](./docs/46-dependencies.md) - Third-party libraries and their usage
- [Browser Support](./docs/47-browser-support.md) - Supported browsers and compatibility
- [Glossary](./docs/48-glossary.md) - Technical terms and definitions

---

## Quick Reference

### Project Commands

```bash
# Development
pnpm dev              # Start dev server on http://localhost:3000
pnpm check            # TypeScript type checking (fast)
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier

# Build
pnpm build            # Production build
pnpm preview          # Preview production build
pnpm analyze          # Analyze bundle size

# Quality
pnpm lint:fix         # Fix ESLint issues
pnpm format:check     # Check formatting
pnpm knip             # Detect dead code
```

### Key File Locations

- **Entry Point:** `/src/main.tsx`
- **Root Layout:** `/src/app/app-layout.tsx`
- **Main Page:** `/src/app/page.tsx`
- **Global Styles:** `/src/app/globals.css`
- **Configuration:** `/src/core/config/app-config.ts`
- **HTTP Client:** `/src/core/services/http/http-client.ts`
- **Environment:** `/.env.local` (create from `.env.example`)

### Important Directories

- `/src/features/` - Feature modules (domain-driven design)
- `/src/core/` - Core infrastructure (config, services, providers)
- `/src/shared/` - Shared utilities and components
- `/src/app/` - Application pages and layouts

### Environment Variables (Required)

```bash
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_APP_BASE_URL=http://localhost:3000
```

### Environment Variables (Optional)

```bash
VITE_API_URL=http://localhost:2024           # LangGraph API URL
VITE_ASSISTANT_ID=assistant                  # Default assistant/graph ID
VITE_AUTH0_AUDIENCE=your-api-audience        # Auth0 API audience
VITE_SENTRY_DSN=your-sentry-dsn             # Sentry error tracking
```

---

## Documentation Conventions

### File Paths

All file paths in this documentation are **absolute paths** from the project root `/home/user/tiler2-ui/`.

Example: `/src/features/chat/components/chat-input.tsx` refers to the full path `/home/user/tiler2-ui/src/features/chat/components/chat-input.tsx`

### Code References

Code references include file path and line numbers where applicable:
- Format: `file_path:line_number`
- Example: `src/features/chat/providers/stream-provider.tsx:45`

### Version Information

- **React:** 19.2.0
- **Vite:** 6.0.11
- **TypeScript:** 5.9.2
- **Node.js:** 18.x or higher
- **pnpm:** 10.14.0

---

## Core Principles

### Architecture Principles

1. **Client-Only Architecture:** No server-side rendering. All rendering happens in the browser.
2. **Streaming-First:** Real-time communication with AI agents via Server-Sent Events.
3. **URL as State:** Primary state is synchronized with URL search parameters.
4. **Feature-Based Organization:** Code organized by business domain, not technical layer.
5. **Type Safety:** Strict TypeScript mode with no implicit any.

### Development Principles

1. **Named Exports Preferred:** Use named exports over default exports for better refactoring.
2. **Co-location:** Keep related files together (components, hooks, types, utils).
3. **Single Responsibility:** Each component/function has one clear purpose.
4. **JSDoc Comments:** All exported functions require JSDoc documentation.
5. **Accessibility First:** ARIA labels, keyboard navigation, semantic HTML.

### State Management Principles

1. **URL First:** Thread ID and major UI state in URL search params.
2. **Context for Global State:** React Context for cross-cutting concerns.
3. **Local State for UI:** Component-specific state stays local.
4. **Optimistic Updates:** Update UI immediately, sync with server asynchronously.

---

## Known Limitations

1. **No Automated Tests:** Currently no unit, integration, or E2E tests in codebase.
2. **No Server-Side Rendering:** Pure client-side application, no SSR/SSG.
3. **No Offline Support:** Requires active internet connection.
4. **File Size Limits:** Max 10 files, 50MB total per message for uploads.
5. **Modern Browsers Only:** No IE11 support, requires ES2020+ browser.

---

## Recent Changes

- **2025-01-18:** Updated to React 19.2.0
- **2025-01-18:** Updated to Vite 6.0.11
- **2025-01-18:** Updated to Tailwind CSS 4.1.11
- **2024-12-XX:** Added Sentry integration for error tracking
- **2024-12-XX:** Implemented PDF upload support
- **2024-12-XX:** Fixed auth callback redirect issues

---

## Support and Resources

- **Issues:** Report bugs and request features on GitHub Issues
- **Discussions:** Community discussions on GitHub Discussions
- **Email:** Support via project maintainers
- **Documentation Updates:** Keep documentation in sync with code changes

---

**Last Updated:** 2025-01-18

**Documentation Version:** 1.0.0
