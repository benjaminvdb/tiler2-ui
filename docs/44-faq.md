# Frequently Asked Questions (FAQ)

This document answers common questions about the project, its architecture, and development practices.

## General Questions

### What is this application?

A production-ready chat interface for LangGraph agents built with React, TypeScript, and Vite. It provides:
- Real-time streaming conversations
- Multimodal support (text, images, files)
- Human-in-the-loop workflows
- Authentication via Auth0
- Artifact rendering in side panel

### What technologies does it use?

**Frontend:**
- React 19 - UI framework
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- Radix UI - Component primitives

**Backend Integration:**
- LangGraph SDK - Agent communication
- Auth0 - Authentication
- Sentry - Error tracking

See [46-dependencies.md](/home/user/tiler2-ui/docs/46-dependencies.md) for complete list.

### Why Vite instead of Next.js?

Vite provides:
- Faster development server (native ESM)
- Simpler configuration
- Better suited for SPA use case
- Smaller production bundle

This is a client-side application that doesn't need Next.js server-side features.

### Is this production-ready?

Yes. The application includes:
- TypeScript strict mode
- Error tracking with Sentry
- Security headers
- Production builds
- Environment variable validation

However, no tests are currently implemented. See [37-testing-strategy.md](/home/user/tiler2-ui/docs/37-testing-strategy.md) for testing roadmap.

## Architecture Questions

### How does the state management work?

The application uses React's built-in state management:
- **Context API** - Sharing state across components
- **useState** - Local component state
- **useReducer** - Complex state logic
- **URL params** - Thread ID persistence

No external state library (Redux, MobX) is needed.

See [06-state-management.md](/home/user/tiler2-ui/docs/06-state-management.md) for details.

### How does streaming work?

Streaming uses Server-Sent Events (SSE) via the LangGraph SDK:

1. Client sends message to LangGraph API
2. API returns SSE stream
3. Client consumes stream with async iteration
4. UI updates incrementally as chunks arrive

See [08-chat-system.md](/home/user/tiler2-ui/docs/08-chat-system.md) for implementation.

### How does authentication work?

Authentication uses Auth0 with OAuth2/PKCE flow:

1. User clicks login
2. Redirects to Auth0
3. User authenticates
4. Auth0 redirects back with code
5. Client exchanges code for tokens
6. Tokens stored in localStorage

See [16-authentication.md](/home/user/tiler2-ui/docs/16-authentication.md) for details.

### Where is the data stored?

- **Messages** - Server-side via LangGraph API
- **Threads** - Server-side via LangGraph API
- **Auth tokens** - Client-side in localStorage
- **Thread ID** - URL search params

No client-side database (IndexedDB, etc.) is used.

## Development Questions

### How do I get started?

```bash
# Clone repository
git clone https://github.com/langchain-ai/agent-chat-ui.git
cd agent-chat-ui

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Configure Auth0 (see docs)
# Edit .env.local with your credentials

# Start development server
pnpm dev
```

See [01-quick-start.md](/home/user/tiler2-ui/docs/01-quick-start.md) for complete setup.

### Can I use npm or yarn instead of pnpm?

While possible, **pnpm is recommended** because:
- Faster installation
- More efficient disk usage
- Stricter dependency resolution
- Project is configured for pnpm

If you must use npm/yarn, delete `pnpm-lock.yaml` and run `npm install` or `yarn install`.

### How do I add a new feature?

1. Create branch: `git checkout -b feat/your-feature`
2. Implement feature following project conventions
3. Add types for type safety
4. Test manually in browser
5. Run quality checks: `pnpm lint && pnpm check`
6. Open pull request

See [40-contributing.md](/home/user/tiler2-ui/docs/40-contributing.md) for guidelines.

### Can I use JavaScript instead of TypeScript?

**Not recommended.** The project is TypeScript-first for:
- Type safety catching bugs at compile time
- Better IDE autocomplete
- Self-documenting code
- Refactoring confidence

All files should be `.ts` or `.tsx`.

### How do I debug issues?

1. **Browser DevTools** - Console, Network, Elements
2. **React DevTools** - Component tree, props, state
3. **VS Code debugger** - Breakpoints in code
4. **Sentry** - Production error tracking

See [39-debugging.md](/home/user/tiler2-ui/docs/39-debugging.md) for strategies.

## Feature Questions

### Can I customize the UI?

Yes! The UI is built with:
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Unstyled component primitives
- **CSS variables** - Theme customization

Modify `/home/user/tiler2-ui/src/app/globals.css` for theming.

See [18-styling-theming.md](/home/user/tiler2-ui/docs/18-styling-theming.md) for details.

### Can I add custom message types?

Yes. The message system is extensible:

1. Add type to `Message` union
2. Create renderer component
3. Add to message switch statement
4. Register with LangGraph backend

See [35-message-format.md](/home/user/tiler2-ui/docs/35-message-format.md) for message structure.

### Can I use a different authentication provider?

Yes, but requires code changes:

1. Remove Auth0 dependencies
2. Implement your auth provider
3. Update protected route logic
4. Modify token handling

Auth0 is deeply integrated, so this is non-trivial.

### Can I deploy without Auth0?

No. Authentication is required for:
- User identification
- Secure API access
- Session management

However, you could:
- Use Auth0 free tier (7,000 MAU)
- Implement custom auth (significant work)
- Use another OAuth provider (requires refactoring)

### How do I add file upload support?

File upload is already implemented:

1. User clicks attachment icon
2. Select file (image or document)
3. File previewed in chat input
4. File sent with message as multimodal content

See [32-module-file-upload.md](/home/user/tiler2-ui/docs/32-module-file-upload.md) for details.

## Deployment Questions

### Where can I deploy this?

Recommended platforms:
- **Vercel** - Easiest, zero-config
- **Netlify** - Simple, good DX
- **Cloudflare Pages** - Fast, global
- **AWS Amplify** - AWS integration
- **GitHub Pages** - Free, basic

See [25-deployment.md](/home/user/tiler2-ui/docs/25-deployment.md) for guides.

### Do I need a server?

No. This is a static single-page application (SPA) that:
- Runs entirely in browser
- Connects to LangGraph API (separate backend)
- Uses Auth0 (hosted authentication)
- Can be served from CDN

### How do I configure environment variables in production?

Each platform has its own method:

**Vercel:**
- Dashboard → Project → Settings → Environment Variables

**Netlify:**
- Site settings → Environment variables

**GitHub Actions:**
- Repository → Settings → Secrets

See [42-environment-variables.md](/home/user/tiler2-ui/docs/42-environment-variables.md) for details.

### How do I set up CI/CD?

The project uses GitHub Actions (if configured):

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - run: pnpm deploy  # Platform-specific
```

Most platforms (Vercel, Netlify) auto-deploy from Git.

## Performance Questions

### Why is the initial load slow?

Possible causes:
1. Large bundle size - Run `pnpm analyze` to check
2. Many dependencies - Consider lazy loading
3. Slow network - Enable caching
4. No code splitting - Already configured in Vite

See [22-performance.md](/home/user/tiler2-ui/docs/22-performance.md) for optimization.

### How do I improve performance?

**Quick wins:**
```typescript
// 1. Lazy load routes
const ThreadView = lazy(() => import('./features/thread/thread-view'));

// 2. Memoize expensive computations
const sorted = useMemo(() => expensiveSort(data), [data]);

// 3. Optimize images
// - Use WebP format
// - Add width/height
// - Lazy load

// 4. Virtual scrolling for long lists
import { FixedSizeList } from 'react-window';
```

### Can I use service workers for offline support?

Yes, but not currently implemented. To add:

1. Install Workbox: `pnpm add workbox-vite-plugin`
2. Configure in `vite.config.ts`
3. Register service worker
4. Handle offline scenarios

See Vite PWA plugin for easier setup.

### How do I reduce bundle size?

```bash
# 1. Analyze bundle
pnpm analyze

# 2. Remove unused dependencies
pnpm knip

# 3. Use dynamic imports
const Component = lazy(() => import('./Component'));

# 4. Tree-shake imports
// Bad
import _ from 'lodash';

// Good
import { debounce } from 'lodash-es';
```

## Security Questions

### Is this application secure?

The application implements:
- ✅ Security headers (X-Frame-Options, etc.)
- ✅ Auth0 OAuth2/PKCE authentication
- ✅ Input sanitization (rehype-sanitize)
- ✅ HTTPS enforcement
- ✅ Environment variable validation
- ❌ CSP (recommended but not implemented)
- ❌ Rate limiting (backend responsibility)

See [41-security.md](/home/user/tiler2-ui/docs/41-security.md) for details.

### Where should I store API keys?

**Client-side API keys:**
- Environment variables with `VITE_` prefix
- Only non-sensitive, public keys
- Never commit to Git

**Server-side API keys:**
- Backend environment variables
- Never expose to client
- Use backend proxy for sensitive operations

See [42-environment-variables.md](/home/user/tiler2-ui/docs/42-environment-variables.md) for best practices.

### How do I prevent XSS attacks?

The application uses:
- React's auto-escaping (default protection)
- `rehype-sanitize` for markdown
- No `dangerouslySetInnerHTML`
- Content Security Policy (recommended)

**Never:**
```typescript
// ❌ Dangerous
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe
<ReactMarkdown rehypePlugins={[rehypeSanitize]}>
  {userInput}
</ReactMarkdown>
```

## Troubleshooting Questions

### Why doesn't my .env.local work?

Common issues:
1. Missing `VITE_` prefix - Required for client variables
2. Not restarted dev server - Changes require restart
3. Wrong file location - Must be in project root
4. Syntax error - No quotes, no spaces around `=`

```bash
# ✅ Correct
VITE_API_URL=http://localhost:2024

# ❌ Wrong
API_URL=http://localhost:2024  # Missing VITE_
VITE_API_URL = http://localhost:2024  # Spaces
VITE_API_URL="http://localhost:2024"  # Quotes (unnecessary)
```

### Why are my changes not showing?

Try:
1. **Hard refresh** - Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
2. **Clear cache** - Browser DevTools → Network → Disable cache
3. **Restart dev server** - Stop and run `pnpm dev` again
4. **Check console** - Look for errors
5. **Clear build** - Delete `dist` and rebuild

### Why is TypeScript complaining?

```bash
# Check for errors
pnpm check

# Common fixes:
# 1. Add explicit types
const value: string = getValue();

# 2. Use type assertion
const element = document.querySelector('.class') as HTMLElement;

# 3. Add null check
if (value !== null) {
  useValue(value);
}
```

### How do I fix ESLint errors?

```bash
# Auto-fix what's possible
pnpm lint:fix

# Manually fix remaining issues
# Common fixes:
# 1. Remove unused variables
# 2. Add missing dependencies to useEffect
# 3. Simplify complex functions
# 4. Fix max-lines-per-function
```

## Miscellaneous Questions

### Can I use this with a different backend?

Yes, but requires adapting the LangGraph SDK calls:

1. Replace SDK with your API client
2. Update message format handling
3. Modify streaming implementation
4. Adjust authentication

The UI is backend-agnostic in principle.

### Is there a demo/playground?

Check the project's homepage or README for demo links. Typically hosted at:
- Official demo: https://agentchat.vercel.app
- Repository: https://github.com/langchain-ai/agent-chat-ui

### How do I contribute?

1. Fork repository
2. Create feature branch
3. Follow coding conventions
4. Submit pull request

See [40-contributing.md](/home/user/tiler2-ui/docs/40-contributing.md) for complete guide.

### Where can I get help?

1. **Documentation** - Read `/home/user/tiler2-ui/docs/`
2. **GitHub Issues** - Search existing issues
3. **GitHub Discussions** - Ask questions
4. **Discord/Slack** - Community chat (if available)

### Can I use this commercially?

Check the LICENSE file in the repository. Typically MIT or Apache 2.0, which allow commercial use.

## Related Documentation

- See [43-common-issues.md](/home/user/tiler2-ui/docs/43-common-issues.md) for problem solutions
- See [01-quick-start.md](/home/user/tiler2-ui/docs/01-quick-start.md) for getting started
- See [48-glossary.md](/home/user/tiler2-ui/docs/48-glossary.md) for terminology

---

**Next:** [45-anti-patterns.md](/home/user/tiler2-ui/docs/45-anti-patterns.md)
