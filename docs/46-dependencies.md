# Dependencies

This document provides an overview of major dependencies, their purposes, update strategies, and security considerations.

## Overview

The project uses modern, well-maintained dependencies from the React and TypeScript ecosystems. All dependencies are managed via pnpm and defined in `/home/user/tiler2-ui/package.json`.

## Core Dependencies

### React Ecosystem

#### react (^19.2.0)

**Purpose:** Core UI framework for building component-based interfaces.

**Why:** React provides:
- Declarative UI paradigm
- Component reusability
- Virtual DOM for performance
- Massive ecosystem and community

**Update strategy:** Follow React's release schedule. Test thoroughly before major version upgrades.

#### react-dom (^19.2.0)

**Purpose:** DOM-specific methods for React, handles browser rendering.

**Why:** Separates core React logic from platform-specific rendering.

**Update strategy:** Always matches React version.

#### react-router-dom (^7.1.3)

**Purpose:** Client-side routing for single-page application navigation.

**Why:** Provides:
- Declarative routing
- Browser history integration
- URL parameter handling
- Nested routes

**Usage:**
```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<ChatView />} />
  </Routes>
</BrowserRouter>
```

**Update strategy:** Minor versions safe, test routing thoroughly on major updates.

### Build Tools

#### vite (^6.0.11)

**Purpose:** Fast build tool and development server.

**Why:** Vite provides:
- Native ESM for instant dev server
- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Built-in TypeScript support

**Update strategy:** Follow Vite's releases. Breaking changes usually well-documented.

#### @vitejs/plugin-react (^4.3.4)

**Purpose:** Official Vite plugin for React with Fast Refresh.

**Why:** Enables React Fast Refresh for instant feedback during development.

**Update strategy:** Keep in sync with Vite version.

### TypeScript

#### typescript (~5.9.2)

**Purpose:** Type-safe JavaScript superset.

**Why:** TypeScript provides:
- Compile-time type checking
- Better IDE support
- Self-documenting code
- Refactoring confidence

**Update strategy:** Minor updates safe. Major versions may require code changes.

### Styling

#### tailwindcss (^4.1.11)

**Purpose:** Utility-first CSS framework.

**Why:** Tailwind provides:
- Rapid UI development
- Consistent design system
- Small production bundle (purges unused styles)
- No context switching between HTML/CSS

**Configuration:** `/home/user/tiler2-ui/tailwind.config.js`

**Update strategy:** Follow Tailwind's upgrade guides. Major versions may change class names.

#### @tailwindcss/postcss (^4.1.11)

**Purpose:** PostCSS plugin for Tailwind processing.

**Update strategy:** Matches Tailwind version.

#### tailwindcss-animate (^1.0.7)

**Purpose:** Animation utilities for Tailwind.

**Why:** Provides ready-made animation classes for common UI transitions.

#### tailwind-scrollbar (^4.0.2)

**Purpose:** Custom scrollbar styling with Tailwind utilities.

**Why:** Enables styled scrollbars matching the application's design.

## UI Components

#### @radix-ui/* (various versions)

**Purpose:** Unstyled, accessible component primitives.

**Included components:**
- `@radix-ui/react-avatar` - Avatar component
- `@radix-ui/react-dialog` - Modal/dialog
- `@radix-ui/react-dropdown-menu` - Dropdown menus
- `@radix-ui/react-label` - Form labels
- `@radix-ui/react-separator` - Visual separators
- `@radix-ui/react-slot` - Component composition
- `@radix-ui/react-switch` - Toggle switches
- `@radix-ui/react-tooltip` - Tooltips

**Why Radix:**
- WAI-ARIA compliant (accessible)
- Unstyled (full design control)
- Composable architecture
- High-quality, well-maintained

**Update strategy:** Generally safe, but test accessibility features.

#### lucide-react (^0.553.0)

**Purpose:** Icon library with React components.

**Why:** Lucide provides:
- Consistent icon design
- Tree-shakeable imports
- TypeScript support
- Large icon collection

**Usage:**
```typescript
import { Send, Upload, Settings } from "lucide-react";

<Send className="w-4 h-4" />
```

**Update strategy:** Patch updates safe. Check changelog for icon changes.

## LangChain/LangGraph

#### @langchain/langgraph-sdk (^1.0.0)

**Purpose:** Official SDK for LangGraph API integration.

**Why:** Provides:
- Type-safe API client
- Streaming support
- Thread management
- Run execution

**Usage:**
```typescript
import { Client } from "@langchain/langgraph-sdk";

const client = new Client({ apiUrl });
const stream = client.runs.stream(threadId, assistantId, { input });
```

**Update strategy:** Follow LangChain's release notes carefully. May have breaking changes.

#### @langchain/langgraph (^1.0.1)

**Purpose:** LangGraph core library for workflow definitions.

**Why:** Provides graph state types and utilities.

**Update strategy:** Coordinate with SDK updates.

#### @langchain/core (^1.0.2)

**Purpose:** Core LangChain abstractions and types.

**Why:** Provides shared message types and interfaces.

**Update strategy:** Keep in sync with other LangChain packages.

## Authentication

#### @auth0/auth0-react (^2.3.1)

**Purpose:** Auth0 React SDK for authentication.

**Why:** Provides:
- OAuth2/OIDC authentication
- PKCE flow for SPAs
- Token management
- React hooks for auth state

**Usage:**
```typescript
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
```

**Update strategy:** Review Auth0 changelog. Security updates should be applied promptly.

## Markdown and Content

#### react-markdown (^10.1.0)

**Purpose:** Markdown rendering component.

**Why:** Renders markdown content as React components.

**Security:** Always use with `rehype-sanitize` to prevent XSS.

#### react-syntax-highlighter (^15.6.1)

**Purpose:** Code syntax highlighting.

**Why:** Provides syntax highlighting for code blocks in messages.

#### remark-gfm (^4.0.1)

**Purpose:** GitHub Flavored Markdown support.

**Why:** Adds tables, strikethrough, task lists, etc.

#### remark-math (^6.0.0) & rehype-katex (^7.0.1)

**Purpose:** Mathematical expression rendering.

**Why:** Renders LaTeX math in markdown using KaTeX.

#### rehype-sanitize (^6.0.0)

**Purpose:** Sanitize HTML in markdown.

**Why:** **Critical for security** - removes malicious HTML/JavaScript from user content.

**Update strategy:** Security-critical. Apply updates promptly.

#### remark-breaks (^4.0.0)

**Purpose:** Converts line breaks to `<br>` tags.

**Why:** Preserves formatting in multi-line messages.

## Utilities

#### clsx (^2.1.1)

**Purpose:** Conditional className construction.

**Usage:**
```typescript
import clsx from "clsx";

<div className={clsx("base-class", { active: isActive, disabled })} />
```

**Why:** Simplifies conditional class application.

#### tailwind-merge (^3.3.1)

**Purpose:** Merges Tailwind classes intelligently.

**Why:** Resolves conflicting Tailwind classes, keeping the last one.

**Usage:**
```typescript
import { cn } from "@/lib/utils";

// Combines clsx + tailwind-merge
<div className={cn("p-4", className, { "bg-red": error })} />
```

#### uuid (^13.0.0)

**Purpose:** Generate UUID identifiers.

**Why:** Creates unique IDs for messages, threads, etc.

#### class-variance-authority (^0.7.1)

**Purpose:** Type-safe variant styling.

**Why:** Manages component variants with TypeScript support.

## Animation

#### framer-motion (^12.23.24)

**Purpose:** Animation library for React.

**Why:** Provides:
- Declarative animations
- Gesture handling
- Layout animations
- Spring physics

**Usage:**
```typescript
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
/>
```

**Update strategy:** Check changelog for API changes.

## Monitoring

#### @sentry/react (^8.47.0)

**Purpose:** Error tracking and performance monitoring.

**Why:** Provides:
- Automatic error capture
- Source map support
- Performance monitoring
- Session replay

**Configuration:** See `/home/user/tiler2-ui/src/infrastructure/monitoring/sentry.ts`

**Update strategy:** Follow Sentry's migration guides.

#### @sentry/vite-plugin (^4.6.0)

**Purpose:** Vite plugin for Sentry source map upload.

**Why:** Enables readable stack traces in production.

## Other Dependencies

#### katex (^0.16.25)

**Purpose:** Fast math typesetting library.

**Why:** Renders mathematical expressions.

#### sonner (^2.0.7)

**Purpose:** Toast notification library.

**Why:** Beautiful, accessible toast notifications.

#### use-stick-to-bottom (^1.1.1)

**Purpose:** Auto-scroll hook for chat interfaces.

**Why:** Keeps chat scrolled to bottom as new messages arrive.

#### p-retry (^4.6.2)

**Purpose:** Retry failed promises with exponential backoff.

**Why:** Improves reliability of network requests.

#### zod (^4.1.12)

**Purpose:** TypeScript-first schema validation.

**Why:** Runtime validation of data with type inference.

**Usage:**
```typescript
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

const validated = schema.parse(data); // Throws if invalid
```

## Development Dependencies

### Linting and Formatting

- `eslint` (^9.32.0) - JavaScript/TypeScript linter
- `prettier` (^3.6.2) - Code formatter
- `prettier-plugin-tailwindcss` (^0.6.14) - Tailwind class sorting

### Type Definitions

- `@types/react` (^19.1.9)
- `@types/react-dom` (^19.1.7)
- `@types/node` (^24.2.0)
- `@types/react-syntax-highlighter` (^15.5.13)
- `@types/uuid` (^10.0.0)

### Build Tools

- `rollup-plugin-visualizer` (^5.12.0) - Bundle analysis
- `postcss` (^8.5.6) - CSS processing

### Code Quality

- `knip` (^5.69.0) - Dead code detection
- `typescript-eslint` (^8.46.4) - TypeScript ESLint rules

## When to Update Dependencies

### Security Updates

**Immediately update when:**
- Security vulnerability reported
- Dependency has known CVE
- `pnpm audit` shows critical issues

```bash
pnpm audit
pnpm audit fix
```

### Regular Updates

**Monthly maintenance:**
```bash
# Check for outdated packages
pnpm outdated

# Update patch versions (safe)
pnpm update

# Update to latest (test thoroughly)
pnpm update --latest
```

### Major Version Updates

**Requires testing:**
1. Read migration guide
2. Update in development branch
3. Run full test suite (when added)
4. Test critical user flows
5. Monitor Sentry after deployment

## Dependency Security

### Security Scanning

```bash
# Audit dependencies
pnpm audit

# Fix automatically when possible
pnpm audit fix

# Check specific package
pnpm audit --filter=package-name
```

### Dependabot Configuration

Recommended `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      production-dependencies:
        dependency-type: "production"
      development-dependencies:
        dependency-type: "development"
```

### Security Best Practices

1. **Review dependencies** before adding
2. **Check bundle size** impact (`pnpm analyze`)
3. **Verify maintenance** status (recent commits, active issues)
4. **Prefer popular** packages with strong communities
5. **Monitor security** advisories
6. **Update regularly** to get security patches

## Removing Dependencies

Before removing:

```bash
# Check what depends on it
pnpm why <package-name>

# Remove from package.json
pnpm remove <package-name>

# Verify build still works
pnpm build

# Check for unused code
pnpm knip
```

## Adding New Dependencies

### Evaluation Checklist

Before adding a dependency:

- [ ] Is it actively maintained?
- [ ] Does it have good documentation?
- [ ] What's the bundle size impact?
- [ ] Are there security vulnerabilities?
- [ ] Is there a lighter alternative?
- [ ] Is it TypeScript-friendly?
- [ ] Does it have good test coverage?

### Installation

```bash
# Production dependency
pnpm add package-name

# Development dependency
pnpm add -D package-name

# Specific version
pnpm add package-name@1.2.3
```

## Bundle Size Optimization

### Analyze Bundle

```bash
pnpm analyze
# Opens visualization of bundle composition
```

### Optimization Strategies

1. **Code splitting** - Already configured in `vite.config.ts`
2. **Tree shaking** - Import only what you need
3. **Dynamic imports** - Lazy load routes/features
4. **Replace large deps** - Find lighter alternatives

### Current Bundle Chunks

From `/home/user/tiler2-ui/vite.config.ts`:

```typescript
manualChunks: {
  react: ["react", "react-dom"],
  router: ["react-router-dom"],
  ui: ["@radix-ui/..."],
  markdown: ["react-markdown", "react-syntax-highlighter", ...],
  langchain: ["@langchain/..."],
}
```

**Why:** Separate chunks improve caching and parallel loading.

## Related Documentation

- See [38-code-quality.md](/home/user/tiler2-ui/docs/38-code-quality.md) for quality tools
- See [41-security.md](/home/user/tiler2-ui/docs/41-security.md) for security practices
- See [24-build-process.md](/home/user/tiler2-ui/docs/24-build-process.md) for build configuration
- See `/home/user/tiler2-ui/package.json` for complete dependency list

---

**Next:** [47-browser-support.md](/home/user/tiler2-ui/docs/47-browser-support.md)
