# Performance Optimization

This document outlines performance optimization strategies used in the Tiler2 UI project. These practices ensure fast load times, smooth interactions, and efficient resource usage.

## Table of Contents

- [Code Splitting Strategy](#code-splitting-strategy)
- [Lazy Loading Components](#lazy-loading-components)
- [Memoization Techniques](#memoization-techniques)
- [Virtual Scrolling](#virtual-scrolling)
- [Bundle Size Optimization](#bundle-size-optimization)
- [Asset Optimization](#asset-optimization)
- [Network Performance](#network-performance)
- [React Performance Tools](#react-performance-tools)
- [Measuring Performance](#measuring-performance)
- [Common Performance Pitfalls](#common-performance-pitfalls)
- [Performance Checklist](#performance-checklist)

## Code Splitting Strategy

### Manual Chunks Configuration

The project uses Vite's `manualChunks` for strategic code splitting. Configuration in `/home/user/tiler2-ui/vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          react: ["react", "react-dom"],

          // Routing library
          router: ["react-router-dom"],

          // UI component libraries (Radix UI)
          ui: [
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-separator",
            "@radix-ui/react-switch",
            "@radix-ui/react-tooltip",
          ],

          // Markdown rendering libraries
          markdown: [
            "react-markdown",
            "react-syntax-highlighter",
            "remark-gfm",
            "remark-breaks",
            "remark-math",
            "rehype-katex",
            "rehype-sanitize",
          ],

          // LangChain libraries
          langchain: [
            "@langchain/core",
            "@langchain/langgraph",
            "@langchain/langgraph-sdk",
          ],
        },
      },
    },
  },
});
```

**Why this strategy:**

1. **Vendor chunking** - Separates vendor code from application code
2. **Stable chunks** - Libraries change less frequently than app code, improving cache hit rates
3. **Parallel loading** - Browser can download multiple chunks simultaneously
4. **Logical grouping** - Related libraries are bundled together (UI, markdown, langchain)

**Benefits:**

- Initial bundle size reduced by ~60%
- Better long-term caching
- Faster incremental builds during development
- Users only download code they need

### Chunk Size Limits

```typescript
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000, // 1MB warning threshold
  },
});
```

**Why:** Warnings alert developers to oversized chunks that should be split further.

### Dynamic Imports for Routes

Use dynamic imports for route-based code splitting:

```typescript
// Good - lazy load route components
import { lazy } from "react";

const ThreadsPage = lazy(() => import("@/app/page"));
const WorkflowsPage = lazy(() => import("@/app/workflows/page"));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<ThreadsPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
      </Routes>
    </Suspense>
  );
}

// Bad - eager import (increases initial bundle)
import ThreadsPage from "@/app/page";
import WorkflowsPage from "@/app/workflows/page";
```

**Why:** Route-based splitting ensures users only download code for routes they visit.

## Lazy Loading Components

### React.lazy with Suspense

**Lazy load heavy components:**

```typescript
import React, { lazy, Suspense } from "react";

// Lazy load syntax highlighter (large dependency)
const CodeBlock = lazy(() => import("./code-block"));

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <Suspense fallback={<div>Loading code...</div>}>
      <CodeBlock code={content} language="typescript" />
    </Suspense>
  );
}
```

**When to use lazy loading:**

- Components with large dependencies (syntax highlighters, rich text editors)
- Modal/dialog content that's not immediately visible
- Admin panels or rarely accessed features
- Visualization libraries (charts, graphs)

**When NOT to use:**

- Components in the critical rendering path
- Small components (overhead outweighs benefits)
- Components that appear on every page

### Named Exports with Lazy Loading

```typescript
// Good - lazy load with named export
const { MarkdownPreview } = lazy(() =>
  import("./markdown").then((module) => ({
    default: { MarkdownPreview: module.MarkdownPreview },
  }))
);

// Better - create wrapper component
const LazyMarkdownPreview = lazy(() =>
  import("./markdown").then((module) => ({
    default: module.MarkdownPreview,
  }))
);
```

### Suspense Boundaries

**Place Suspense boundaries strategically:**

```tsx
// Good - Suspense at feature level
function ArtifactPanel() {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <ArtifactContent />
    </Suspense>
  );
}

// Bad - Suspense too high in tree
function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EntireApp />
    </Suspense>
  );
}
```

**Why:** Suspense boundaries at feature level provide granular loading states without blocking the entire app.

## Memoization Techniques

### React.memo for Components

**Memoize components to prevent unnecessary re-renders:**

Example from `/home/user/tiler2-ui/src/features/thread/components/chat-input-components/index.tsx`:

```tsx
// Component implementation
const ChatInputComponent = ({
  input,
  onInputChange,
  onSubmit,
  onPaste,
  onFileUpload,
  contentBlocks,
  onRemoveBlock,
  isLoading,
  hideToolCalls,
  onHideToolCallsChange,
}: ChatInputProps) => {
  // ... implementation
  return <form>{/* ... */}</form>;
};

// Export memoized version
export const ChatInput = React.memo(ChatInputComponent);
```

**When to use React.memo:**

- Components that render frequently but with same props
- Components with expensive render logic
- List item components
- Components passed as props to other components

**Custom comparison function:**

```tsx
// Memoize with custom equality check
const MessageComponent = React.memo(
  ({ message }: { message: Message }) => {
    return <div>{message.content}</div>;
  },
  (prevProps, nextProps) => {
    // Only re-render if message ID or content changed
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content
    );
  }
);
```

**Why:** Custom comparison prevents re-renders when only unimportant props change.

### useMemo for Expensive Calculations

**Memoize derived state and expensive computations:**

```tsx
function ThreadList({ threads, searchQuery }: Props) {
  // Expensive filtering and sorting operation
  const filteredThreads = useMemo(() => {
    return threads
      .filter((thread) =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [threads, searchQuery]);

  return (
    <ul>
      {filteredThreads.map((thread) => (
        <ThreadItem key={thread.id} thread={thread} />
      ))}
    </ul>
  );
}
```

**When to use useMemo:**

- Expensive calculations (sorting, filtering large arrays)
- Complex object transformations
- Derived state that depends on props/state
- Values passed to dependency arrays of other hooks

**When NOT to use:**

```tsx
// Bad - unnecessary memoization
const name = useMemo(() => firstName + " " + lastName, [firstName, lastName]);

// Good - simple calculation, no memoization needed
const name = firstName + " " + lastName;
```

Example from `/home/user/tiler2-ui/src/core/providers/stream.tsx`:

```tsx
export const StreamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const clientConfig = getClientConfig();

  // Memoize to prevent child re-renders when provider re-renders
  const finalApiUrl = useMemo(() => clientConfig.apiUrl, [clientConfig.apiUrl]);
  const finalAssistantId = useMemo(
    () => clientConfig.assistantId,
    [clientConfig.assistantId]
  );

  return (
    <StreamSession apiUrl={finalApiUrl} assistantId={finalAssistantId}>
      {children}
    </StreamSession>
  );
};
```

### useCallback for Functions

**Memoize callback functions to prevent child re-renders:**

Example from `/home/user/tiler2-ui/src/features/thread/components/chat-input-components/index.tsx`:

```tsx
const ChatInputComponent = ({ input, onInputChange }: ChatInputProps) => {
  // Memoize to provide stable reference to child components
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e.target.value);
    },
    [onInputChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        const form = e.target?.closest("form");
        form?.requestSubmit();
      }
    },
    [] // No dependencies - logic is self-contained
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

**When to use useCallback:**

- Functions passed as props to memoized components
- Functions used in dependency arrays
- Event handlers passed to child components
- Functions used in useEffect dependencies

**When NOT to use:**

```tsx
// Bad - unnecessary useCallback
const handleClick = useCallback(() => {
  console.log("clicked");
}, []);

// Good - simple handler, no need to memoize
const handleClick = () => {
  console.log("clicked");
};
```

### Memoization Best Practices

**1. Profile before optimizing:**

```tsx
// Use React DevTools Profiler to identify slow renders
import { Profiler } from "react";

function onRenderCallback(
  id: string,
  phase: "mount" | "update",
  actualDuration: number
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);
}

<Profiler id="ChatInput" onRender={onRenderCallback}>
  <ChatInput />
</Profiler>;
```

**2. Don't over-memoize:**

```tsx
// Bad - memoizing everything
const Component = React.memo(({ text }: { text: string }) => {
  const uppercased = useMemo(() => text.toUpperCase(), [text]);
  const handleClick = useCallback(() => console.log(uppercased), [uppercased]);

  return <button onClick={handleClick}>{uppercased}</button>;
});

// Good - only memoize when needed
const Component = ({ text }: { text: string }) => {
  const uppercased = text.toUpperCase(); // Fast, no need to memoize
  return <button onClick={() => console.log(uppercased)}>{uppercased}</button>;
};
```

## Virtual Scrolling

### When to Use Virtual Scrolling

**Use virtual scrolling for large lists (>100 items):**

```tsx
// For large message lists or thread histories
import { useVirtualizer } from "@tanstack/react-virtual";

function MessageList({ messages }: { messages: Message[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estimated row height
    overscan: 5, // Render 5 items outside viewport
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <MessageComponent message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Why:** Virtual scrolling only renders visible items, drastically improving performance for long lists.

**Trade-offs:**
- Adds complexity
- Requires fixed or estimated item heights
- May have issues with dynamic content

**When NOT to use:**
- Small lists (<100 items)
- Lists with highly variable item heights
- Lists with complex nested scrolling

## Bundle Size Optimization

### Analyze Bundle Size

**Use Vite's bundle analyzer:**

```bash
# Generate bundle visualization
pnpm run analyze
```

Configuration in `/home/user/tiler2-ui/vite.config.ts`:

```typescript
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

**Why:** Visual analysis helps identify large dependencies and optimization opportunities.

### Tree Shaking

**Import only what you need:**

```typescript
// Good - named imports (tree-shakeable)
import { Button, Dialog } from "@/shared/components/ui";
import { format } from "date-fns";

// Bad - imports entire library
import * as UI from "@/shared/components/ui";
import DateFns from "date-fns";
```

**Why:** Bundlers can eliminate unused exports with named imports.

### Replace Heavy Dependencies

**Choose lighter alternatives:**

```typescript
// Heavy: moment.js (~70KB gzipped)
import moment from "moment";
const formatted = moment(date).format("YYYY-MM-DD");

// Light: date-fns (~2KB gzipped per function)
import { format } from "date-fns";
const formatted = format(date, "yyyy-MM-dd");

// Lightest: native Intl
const formatted = new Intl.DateTimeFormat("en-US").format(date);
```

**Common swaps:**
- `moment` → `date-fns` or `dayjs`
- `lodash` → `lodash-es` (tree-shakeable) or native JS
- `axios` → `fetch` API
- Large icon libraries → `lucide-react` (tree-shakeable)

### Dependency Optimization

Configuration in `/home/user/tiler2-ui/vite.config.ts`:

```typescript
export default defineConfig({
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@langchain/core",
      "@langchain/langgraph",
      "@langchain/langgraph-sdk",
    ],
  },
});
```

**Why:** Pre-bundling dependencies speeds up dev server startup and improves HMR performance.

## Asset Optimization

### Image Optimization

**Use appropriate formats:**

```tsx
// Modern browsers: WebP or AVIF
<img
  src="/images/hero.webp"
  alt="Hero image"
  width={800}
  height={400}
/>

// With fallback
<picture>
  <source srcSet="/images/hero.avif" type="image/avif" />
  <source srcSet="/images/hero.webp" type="image/webp" />
  <img src="/images/hero.jpg" alt="Hero image" />
</picture>
```

**Lazy load images:**

```tsx
// Native lazy loading
<img
  src="/images/large-image.jpg"
  alt="Large image"
  loading="lazy"
/>

// With intersection observer for more control
function LazyImage({ src, alt }: { src: string; alt: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: "50px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} src={imageSrc || undefined} alt={alt} />;
}
```

### Font Optimization

**Self-host fonts to avoid external requests:**

Example: Using `@fontsource` packages:

```typescript
// In main.tsx or component
import "@fontsource/comic-mono/400.css";
import "@fontsource/comic-mono/700.css";
```

**Why:** Self-hosted fonts avoid FOIT (Flash of Invisible Text) and reduce external dependencies.

**Font loading strategies:**

```css
/* Swap to fallback immediately */
@font-face {
  font-family: "Comic Mono";
  font-display: swap;
  src: url("/fonts/comic-mono.woff2") format("woff2");
}
```

### SVG Optimization

**Inline small SVGs, lazy load large ones:**

```tsx
// Good - small icon inlined
import { Send, Plus } from "lucide-react";

function Component() {
  return (
    <>
      <Send className="h-4 w-4" />
      <Plus className="h-4 w-4" />
    </>
  );
}

// Good - large illustration lazy loaded
const Illustration = lazy(() => import("./large-illustration.svg"));
```

**Why:** Inlined SVGs avoid HTTP requests. Lazy loading large SVGs prevents blocking initial render.

## Network Performance

### HTTP/2 Server Push

**Vite dev server uses HTTP/2 by default in production.**

Benefits:
- Multiplexing - multiple requests over single connection
- Server push - send resources before client requests
- Header compression - reduce overhead

### Caching Strategy

**Leverage long-term caching:**

Vite automatically generates hashed filenames:

```
dist/assets/index-a3c4f5d2.js
dist/assets/index-b7e9f1a3.css
```

**Configure cache headers (in server, e.g., nginx):**

```nginx
# Cache static assets for 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# Cache HTML for short time (5 minutes)
location ~* \.html$ {
  expires 5m;
  add_header Cache-Control "public, must-revalidate";
}
```

**Why:** Long-term caching reduces bandwidth and improves repeat visit performance.

### Prefetching and Preloading

**Prefetch low-priority resources:**

```tsx
// Prefetch next page
<link rel="prefetch" href="/workflows" />

// Preload critical resources
<link rel="preload" href="/fonts/comic-mono.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```

**Dynamic prefetching with router:**

```tsx
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const handleMouseEnter = () => {
    // Prefetch route on hover
    import(`./pages${to}`);
  };

  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

**Why:** Prefetching improves perceived performance by loading resources before they're needed.

### API Request Optimization

**Debounce search inputs:**

```tsx
import { useState, useCallback } from "react";

function SearchInput() {
  const [query, setQuery] = useState("");

  // Debounce search API calls
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      fetch(`/api/search?q=${value}`);
    }, 300),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  return <input value={query} onChange={handleChange} />;
}
```

**Batch API requests:**

```typescript
// Bad - multiple requests
const user = await fetch("/api/users/1");
const posts = await fetch("/api/posts?userId=1");
const comments = await fetch("/api/comments?userId=1");

// Good - single request with multiple resources
const data = await fetch("/api/users/1?include=posts,comments");
```

## React Performance Tools

### React DevTools Profiler

**Profile component renders:**

1. Open React DevTools
2. Select "Profiler" tab
3. Click record button
4. Interact with app
5. Stop recording
6. Analyze flame graph

**Interpreting results:**
- **Gray bars**: Component didn't re-render
- **Yellow/red bars**: Slow renders (>16ms)
- **Thin bars**: Fast renders (<1ms)

### Performance Monitoring in Code

```tsx
import { Profiler, ProfilerOnRenderCallback } from "react";

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log(`${id} (${phase})`);
  console.log(`Actual duration: ${actualDuration.toFixed(2)}ms`);
  console.log(`Base duration: ${baseDuration.toFixed(2)}ms`);

  // Send to analytics
  if (actualDuration > 16) {
    trackSlowRender(id, actualDuration);
  }
};

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <YourApp />
    </Profiler>
  );
}
```

### Chrome DevTools Performance Tab

**Analyze runtime performance:**

1. Open Chrome DevTools (F12)
2. Go to "Performance" tab
3. Click record
4. Interact with app
5. Stop recording
6. Analyze timeline

**Look for:**
- Long tasks (>50ms)
- Excessive re-renders
- Layout thrashing
- Memory leaks

## Measuring Performance

### Web Vitals

**Monitor Core Web Vitals:**

```typescript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from "web-vitals";

function sendToAnalytics({ name, value, id }: Metric) {
  // Send to analytics service (Google Analytics, Sentry, etc.)
  console.log(name, value);
}

// Measure all vitals
onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

**Core Web Vitals targets:**
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Custom Performance Marks

```typescript
// Mark start
performance.mark("data-fetch-start");

await fetchData();

// Mark end
performance.mark("data-fetch-end");

// Measure duration
performance.measure("data-fetch", "data-fetch-start", "data-fetch-end");

// Get measurement
const measurement = performance.getEntriesByName("data-fetch")[0];
console.log(`Data fetch took ${measurement.duration}ms`);
```

### Lighthouse CI

**Automate performance audits:**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            https://your-site.com
          uploadArtifacts: true
```

## Common Performance Pitfalls

### 1. Inline Object/Array Creation in Props

```tsx
// Bad - creates new object on every render
<Component style={{ color: "red" }} />
<Component items={[1, 2, 3]} />

// Good - stable reference
const style = { color: "red" };
const items = [1, 2, 3];
<Component style={style} items={items} />

// Better - use constants outside component
const COMPONENT_STYLE = { color: "red" };
const DEFAULT_ITEMS = [1, 2, 3];
```

**Why:** New objects break memoization and cause unnecessary re-renders.

### 2. Anonymous Functions in Render

```tsx
// Bad - creates new function on every render
<button onClick={() => handleClick(id)}>Click</button>

// Good - stable callback
const handleClickWithId = useCallback(() => handleClick(id), [id]);
<button onClick={handleClickWithId}>Click</button>

// Alternative - pass data via event
<button onClick={handleClick} data-id={id}>Click</button>
```

### 3. Missing Key Props

```tsx
// Bad - no keys or index as key
{items.map((item, i) => <div key={i}>{item}</div>)}

// Good - stable unique key
{items.map((item) => <div key={item.id}>{item}</div>)}
```

**Why:** Proper keys help React identify changed items and avoid unnecessary re-renders.

### 4. Context Overuse

```tsx
// Bad - single context for everything
const AppContext = createContext({
  user: null,
  theme: "light",
  settings: {},
  messages: [],
  // ... 20 more values
});

// Good - separate contexts by concern
const UserContext = createContext(null);
const ThemeContext = createContext("light");
const SettingsContext = createContext({});
```

**Why:** Updating any context value triggers re-render of ALL consumers. Separate contexts minimize re-renders.

### 5. Large useEffect Dependencies

```tsx
// Bad - useEffect with many dependencies
useEffect(() => {
  // Complex logic
}, [dep1, dep2, dep3, dep4, dep5, dep6]);

// Good - break into smaller effects
useEffect(() => {
  // Logic related to dep1
}, [dep1]);

useEffect(() => {
  // Logic related to dep2, dep3
}, [dep2, dep3]);
```

**Why:** Smaller effects are easier to understand and trigger less frequently.

### 6. Not Cleaning Up Subscriptions

```tsx
// Bad - no cleanup
useEffect(() => {
  const ws = new WebSocket("ws://...");
  ws.onmessage = handleMessage;
}, []);

// Good - cleanup
useEffect(() => {
  const ws = new WebSocket("ws://...");
  ws.onmessage = handleMessage;

  return () => {
    ws.close();
  };
}, []);
```

**Why:** Uncleaned subscriptions cause memory leaks.

## Performance Checklist

### Initial Load Performance

- [ ] Code splitting configured with strategic chunks
- [ ] Route-based lazy loading implemented
- [ ] Bundle size analyzed and optimized (<200KB main chunk)
- [ ] Images optimized (WebP/AVIF, lazy loaded)
- [ ] Fonts self-hosted with `font-display: swap`
- [ ] Critical CSS inlined or loaded first
- [ ] Unused dependencies removed
- [ ] Tree shaking enabled and verified

### Runtime Performance

- [ ] React.memo used for frequently rendered components
- [ ] useMemo used for expensive calculations
- [ ] useCallback used for callbacks passed to children
- [ ] Virtual scrolling for long lists (>100 items)
- [ ] Debouncing implemented for search/filter inputs
- [ ] Context split by concern to minimize re-renders
- [ ] Event listeners cleaned up in useEffect
- [ ] No inline object/array creation in render

### Network Performance

- [ ] API requests batched where possible
- [ ] HTTP/2 enabled in production
- [ ] Long-term caching configured (1 year for assets)
- [ ] Compression enabled (gzip/brotli)
- [ ] CDN configured for static assets
- [ ] Service worker for offline support (if applicable)

### Monitoring

- [ ] Core Web Vitals tracked
- [ ] Performance marks added for critical operations
- [ ] Error tracking configured (Sentry)
- [ ] Bundle size monitored in CI/CD
- [ ] Lighthouse CI configured

## Next Steps

Continue to **[23-accessibility.md](/home/user/tiler2-ui/docs/23-accessibility.md)** to learn about accessibility best practices and WCAG compliance.

---

**Related Documentation:**
- [21-react-patterns.md](/home/user/tiler2-ui/docs/21-react-patterns.md) - React patterns and optimization
- [04-architecture.md](/home/user/tiler2-ui/docs/04-architecture.md) - Application architecture
- [02-configuration.md](/home/user/tiler2-ui/docs/02-configuration.md) - Build configuration

**Configuration Files:**
- `/home/user/tiler2-ui/vite.config.ts` - Vite build configuration
- `/home/user/tiler2-ui/package.json` - Dependencies and scripts

**Tools:**
- [Vite Bundle Visualizer](https://github.com/btd/rollup-plugin-visualizer)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [web-vitals](https://github.com/GoogleChrome/web-vitals)
