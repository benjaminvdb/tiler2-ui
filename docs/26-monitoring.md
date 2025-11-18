# Monitoring and Observability

## Overview

The application uses a comprehensive monitoring and observability system combining Sentry for error tracking, custom observability services for structured logging, and network status monitoring. This guide explains the monitoring setup, error reporting strategies, and production best practices.

**Monitoring Stack:**
- **Sentry**: Error tracking, performance monitoring, session replay
- **Observability Service**: Structured logging and error categorization
- **Network Monitor**: Connection status tracking
- **Source Maps**: Readable stack traces in production

**Key Features:**
- Automatic error capture and reporting
- User context enrichment (Auth0 integration)
- Performance tracking and slow operation detection
- Network status notifications
- Error categorization and severity levels

---

## Sentry Integration

### Initial Setup

Sentry is initialized in `/home/user/tiler2-ui/src/main.tsx`:

```typescript
import * as Sentry from "@sentry/react";
import { env } from "./env";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: import.meta.env.MODE,
    ...(env.APP_VERSION && {
      release: `agent-chat-ui@${env.APP_VERSION}`,
    }),
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

**Configuration Breakdown:**

1. **Conditional Initialization:**
   - Only initializes if `VITE_SENTRY_DSN` is set
   - Prevents Sentry in development when DSN not configured
   - No network requests without DSN

2. **Environment Tracking:**
   - Uses `import.meta.env.MODE` (development/production)
   - Helps filter errors by environment in Sentry dashboard

3. **Release Tracking:**
   - Release name: `agent-chat-ui@{version}`
   - Version from `package.json` via `VITE_APP_VERSION`
   - Enables tracking which version introduced errors

4. **Browser Tracing:**
   - Tracks page loads and navigation
   - Measures performance metrics
   - Captures user interactions

5. **Session Replay:**
   - Records 10% of normal sessions (`replaysSessionSampleRate: 0.1`)
   - Records 100% of sessions with errors (`replaysOnErrorSampleRate: 1.0`)
   - Text and media NOT masked (`maskAllText: false`, `blockAllMedia: false`)
   - Helps reproduce bugs visually

6. **Trace Sampling:**
   - `tracesSampleRate: 1.0` - Captures all transactions
   - Reduce to 0.1 or 0.01 for high-traffic applications
   - Balance between data granularity and quota limits

### Environment Variables

```bash
# Client-side DSN (exposed to browser)
VITE_SENTRY_DSN=https://key@o0.ingest.sentry.io/project-id

# Build-time variables (for source map upload)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_your-token-here
```

**Obtaining Values:**

1. **DSN:**
   - Go to Sentry dashboard → **Settings → Projects → [Project] → Client Keys**
   - Copy DSN (public, safe to expose in browser)

2. **Org & Project:**
   - Org: URL slug (e.g., `https://sentry.io/organizations/{org-slug}/`)
   - Project: Project slug from project settings

3. **Auth Token:**
   - **Settings → Account → API → Auth Tokens**
   - Create token with scopes: `project:read`, `project:releases`, `org:read`
   - Keep secure (never commit to git)

---

## Error Reporting and Stack Traces

### Error Boundary Integration

React Error Boundaries catch rendering errors:

```typescript
// src/main.tsx
<Sentry.ErrorBoundary fallback={<div>An error occurred</div>}>
  <BrowserRouter>
    <Auth0ProviderWithNavigate>
      <App />
    </Auth0ProviderWithNavigate>
  </BrowserRouter>
</Sentry.ErrorBoundary>
```

**What It Catches:**
- Component render errors
- Lifecycle method errors
- Constructor errors

**What It Doesn't Catch:**
- Event handlers (use try/catch)
- Async code (use error handling in promises)
- Server-side rendering errors
- Errors in Error Boundary itself

### Manual Error Reporting

Use the observability service for manual error capture:

```typescript
import { reportError, reportAuthError, reportApiError } from "@/core/services/observability";

// General error
reportError(
  new Error("Something went wrong"),
  "error",           // severity: fatal | error | warn | info | debug
  "api",             // category: auth | api | ui | stream | network | etc.
  {
    operation: "fetchUserData",
    component: "UserProfile",
    userId: user.id,
  }
);

// Convenience methods with preset category
reportAuthError(error, { operation: "login" });
reportApiError(error, { operation: "fetchThreads" });
```

**Available Report Functions:**

```typescript
// From src/core/services/observability/client.ts
reportError(error, severity, category, context)    // General
reportAuthError(error, context)                    // Auth errors
reportApiError(error, context)                     // API errors
reportValidationError(error, context)              // Validation
reportUiError(error, context)                      // UI errors
reportStreamError(error, context)                  // Stream errors
reportThreadError(error, context)                  // Thread errors
reportFileUploadError(error, context)              // File upload
reportStorageError(error, context)                 // Storage
reportNetworkError(error, context)                 // Network
reportCriticalError(error, context)                // Critical/fatal
reportRetryExhausted(error, context)               // Retry failures
reportErrorBoundary(error, errorInfo)              // Error boundaries
```

### Stack Traces

**Development:**
- Full TypeScript stack traces in browser console
- No external dependencies

**Production:**
- Minified JavaScript with cryptic stack traces
- Sentry uses uploaded source maps to de-obfuscate
- Readable stack traces in Sentry dashboard

**Source Map Flow:**

1. **Build:** Vite generates `.js.map` files
2. **Upload:** Sentry Vite plugin uploads maps to Sentry
3. **Delete:** Plugin deletes `.js.map` from `dist/` for security
4. **Error Occurs:** User encounters error in production
5. **Report:** Browser sends minified stack trace to Sentry
6. **Transform:** Sentry uses source maps to show original code
7. **Display:** Readable TypeScript stack trace in dashboard

**Example Stack Trace Transformation:**

**Before (Minified):**
```
Error: Failed to fetch
  at r.fetchThreads (index-a3f4b2c1.js:45:2341)
  at o (index-a3f4b2c1.js:23:1234)
```

**After (Source Mapped):**
```
Error: Failed to fetch
  at ThreadService.fetchThreads (src/features/threads/services/thread-service.ts:42:15)
  at useThreads (src/features/threads/hooks/use-threads.ts:18:23)
```

---

## Source Map Support

### Configuration

Source maps are configured in multiple places:

**1. Vite Config** (`/home/user/tiler2-ui/vite.config.ts`):
```typescript
export default defineConfig({
  build: {
    sourcemap: true, // Generate source maps
  },
  plugins: [
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: "./dist/**",
        filesToDeleteAfterUpload: ["**/*.js.map"], // Security
      },
      telemetry: false,
    }),
  ],
});
```

**2. Build Script** (`package.json`):
```json
{
  "scripts": {
    "build": "VITE_APP_VERSION=$(node -p \"require('./package.json').version\") tsc && vite build"
  }
}
```

**3. Environment Variables:**
```bash
# Required for source map upload
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_your-auth-token
```

### Upload Process

**Automatic Upload During Build:**

1. Run `pnpm build`
2. Vite generates minified JS + source maps
3. Sentry plugin detects source maps in `dist/`
4. Plugin creates Sentry release: `agent-chat-ui@{version}`
5. Plugin uploads all `.js.map` files to Sentry
6. Plugin deletes `.js.map` files from `dist/`
7. Build completes with only minified JS (no maps)

**Manual Upload (Debug):**
```bash
# Upload source maps manually
npx @sentry/cli sourcemaps upload \
  --org=your-org \
  --project=your-project \
  --auth-token=your-token \
  --release=agent-chat-ui@1.0.0 \
  ./dist

# Verify upload
npx @sentry/cli releases files agent-chat-ui@1.0.0 list
```

### Security Considerations

**Why Delete Source Maps:**
- Source maps expose original source code
- Could reveal business logic or vulnerabilities
- Not needed in production bundle
- Only stored securely in Sentry servers

**Access Control:**
- Only team members with Sentry access can view source maps
- Configure Sentry team permissions carefully
- Use Sentry's IP allowlisting for sensitive projects

---

## Performance Monitoring

### Automatic Performance Tracking

Sentry automatically tracks:

**Web Vitals:**
- **LCP (Largest Contentful Paint)**: Main content load time
- **FID (First Input Delay)**: Interactivity delay
- **CLS (Cumulative Layout Shift)**: Visual stability

**Transactions:**
- Page loads
- Navigation events
- Component renders (with React integration)

**Network Requests:**
- API calls (if instrumented)
- Resource loading times

### Custom Performance Tracking

Use the observability service for custom tracking:

```typescript
import { trackPerformance } from "@/core/services/observability";

// Track operation performance
const start = Date.now();
await someExpensiveOperation();
const duration = Date.now() - start;

trackPerformance("expensiveOperation", duration, {
  component: "DataProcessor",
  recordCount: 1000,
});
```

**Automatic Slow Operation Detection:**

```typescript
// From src/core/services/observability/client.ts
export const trackPerformance = (
  operation: string,
  duration: number,
  context?: ObservabilityContext,
): void => {
  // Add breadcrumb for context
  Sentry.addBreadcrumb({
    category: "performance",
    message: `${operation} completed`,
    level: duration > 5000 ? "warning" : "info",
    data: { operation, duration, ...context },
  });

  // Report slow operations as errors
  if (duration > 5000) {
    reportError(
      `Slow operation detected: ${operation} took ${duration}ms`,
      "info",
      "unknown",
      {
        operation,
        ...context,
        additionalData: { duration, threshold: 5000 },
      },
    );
  }
};
```

**Threshold:** Operations taking > 5 seconds are flagged as slow

### Performance Budget

Set performance budgets in Vite config:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000, // KB
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies
          react: ["react", "react-dom"],
          markdown: ["react-markdown", "remark-gfm"],
        },
      },
    },
  },
});
```

---

## Custom Error Context

### User Context Enrichment

The application automatically enriches errors with user context from Auth0:

```typescript
// src/core/providers/sentry-user-context.tsx
import * as Sentry from "@sentry/react";

export const SentryUserContext: React.FC<{ user }> = ({ user }) => {
  useEffect(() => {
    if (!user?.sub) {
      Sentry.setUser(null);
      return;
    }

    // Set user information
    Sentry.setUser({
      id: user.sub,
      ...(user.email && { email: user.email }),
      ...(user.nickname || user.name
        ? { username: user.nickname || user.name }
        : {}),
    });

    // Set organization context
    if (user.org_id || user.org_name) {
      Sentry.setContext("organization", {
        id: user.org_id,
        name: user.org_name,
      });
    }

    // Set helpful tags
    Sentry.setTags({
      user_has_email: !!user.email,
      user_has_picture: !!user.picture,
    });

    return () => {
      Sentry.setUser(null);
    };
  }, [user]);

  return null;
};
```

**User Context Benefits:**
- Filter errors by specific users
- Contact affected users
- Identify patterns by user attributes
- Track errors per organization

### Adding Custom Context

Add custom context to errors:

```typescript
import * as Sentry from "@sentry/react";

// Set custom tags
Sentry.setTag("feature", "chat");
Sentry.setTag("experiment", "new-ui");

// Set custom context
Sentry.setContext("thread", {
  id: threadId,
  messageCount: messages.length,
  status: threadStatus,
});

// Add breadcrumbs
Sentry.addBreadcrumb({
  category: "user-action",
  message: "User sent message",
  level: "info",
  data: {
    messageLength: message.length,
    hasAttachment: !!attachment,
  },
});
```

### Observability Context

The observability service supports structured context:

```typescript
import { observability } from "@/core/services/observability";

// Create scoped logger with context
const logger = observability.child({
  component: "MessageSender",
  threadId: thread.id,
  userId: user.id,
});

// All logs include this context
logger.info("Sending message", { messageId: msg.id });
logger.error(error, { operation: "sendMessage" });
```

**Context Structure:**

```typescript
interface ObservabilityContext {
  component?: string;        // Component name
  operation?: string;        // Operation being performed
  threadId?: string;         // Thread/conversation ID
  userId?: string;           // User ID
  url?: string;              // Current URL
  userAgent?: string;        // Browser user agent
  timestamp?: number;        // Unix timestamp
  additionalData?: Record<string, unknown>;  // Extra data
  skipNotification?: boolean; // Suppress toast
}
```

---

## User Feedback Integration

### Sentry User Feedback Widget

Enable user feedback for errors:

```typescript
// After an error occurs
import * as Sentry from "@sentry/react";

try {
  // Risky operation
} catch (error) {
  const eventId = Sentry.captureException(error);

  // Show feedback dialog
  Sentry.showReportDialog({
    eventId,
    title: "It looks like we're having issues.",
    subtitle: "Our team has been notified.",
    subtitle2: "If you'd like to help, tell us what happened below.",
    labelName: "Name",
    labelEmail: "Email",
    labelComments: "What happened?",
    labelClose: "Close",
    labelSubmit: "Submit",
  });
}
```

### Custom Feedback Form

Create custom feedback integrated with Sentry:

```typescript
import * as Sentry from "@sentry/react";

const submitFeedback = async (feedback: string) => {
  Sentry.captureMessage("User Feedback", {
    level: "info",
    tags: { type: "user-feedback" },
    contexts: {
      feedback: {
        message: feedback,
        timestamp: Date.now(),
        url: window.location.href,
      },
    },
  });
};
```

---

## Network Status Monitoring

### Network Status Provider

The application monitors network connectivity:

```typescript
// src/core/providers/network-status-provider.tsx
import { toast } from "sonner";

export const NetworkStatusProvider: React.FC = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connection restored", {
        duration: 3000,
        id: "network-status",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline. Some features may not work.", {
        duration: Infinity,
        id: "network-status",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={{ isOnline }}>
      {children}
    </NetworkStatusContext.Provider>
  );
};
```

### Using Network Status

Check network status in components:

```typescript
import { useNetworkStatus } from "@/core/providers/network-status-provider";

function MyComponent() {
  const { isOnline } = useNetworkStatus();

  const handleAction = async () => {
    if (!isOnline) {
      toast.error("Cannot perform action while offline");
      return;
    }

    // Proceed with network request
    await apiCall();
  };

  return (
    <div>
      {!isOnline && (
        <Banner variant="warning">
          You are currently offline
        </Banner>
      )}
      <button onClick={handleAction} disabled={!isOnline}>
        Submit
      </button>
    </div>
  );
}
```

**Features:**
- Automatic online/offline detection
- Toast notifications for status changes
- Offline notification persists (duration: Infinity)
- Online notification auto-dismisses (duration: 3s)
- Context available via `useNetworkStatus()` hook

---

## Analytics Considerations

### Privacy-First Analytics

**Current State:**
- No analytics tracking by default
- Sentry Session Replay samples 10% of sessions
- All user data controlled by Auth0

**Adding Analytics (Optional):**

**Google Analytics 4:**
```typescript
// src/analytics/ga4.ts
import ReactGA from "react-ga4";

if (import.meta.env.PROD && env.GA_MEASUREMENT_ID) {
  ReactGA.initialize(env.GA_MEASUREMENT_ID);
}

export const trackPageView = (path: string) => {
  if (import.meta.env.PROD) {
    ReactGA.send({ hitType: "pageview", page: path });
  }
};
```

**Plausible Analytics (Privacy-Focused):**
```html
<!-- index.html -->
<script defer data-domain="yourdomain.com"
  src="https://plausible.io/js/script.js"></script>
```

**Posthog (Open Source):**
```typescript
import posthog from 'posthog-js';

if (import.meta.env.PROD) {
  posthog.init(env.POSTHOG_KEY, {
    api_host: 'https://app.posthog.com'
  });
}
```

### Event Tracking

Track custom events with Sentry:

```typescript
import * as Sentry from "@sentry/react";

// Track feature usage
Sentry.addBreadcrumb({
  category: "user-action",
  message: "User created new thread",
  level: "info",
  data: {
    threadId: thread.id,
    messageCount: 1,
  },
});

// Track conversion events
Sentry.captureMessage("User completed onboarding", {
  level: "info",
  tags: { event: "conversion", type: "onboarding" },
});
```

---

## Production Monitoring Best Practices

### Error Rate Monitoring

**Set Up Alerts:**

1. **Sentry Dashboard:**
   - Go to **Alerts → Create Alert**
   - Set threshold (e.g., "10 errors in 5 minutes")
   - Configure notification channels (email, Slack, PagerDuty)

2. **Alert Examples:**
   ```
   # High error rate
   Errors > 50 in 1 hour

   # Specific error types
   Auth errors > 5 in 10 minutes

   # Performance degradation
   Average response time > 3 seconds
   ```

### Health Checks

**Endpoint Monitoring:**
```typescript
// Optional: Add health check endpoint
// src/health.ts
export const healthCheck = async () => {
  return {
    status: "ok",
    version: env.APP_VERSION,
    timestamp: Date.now(),
  };
};
```

**External Monitoring:**
- Use UptimeRobot or Pingdom to monitor availability
- Check every 5 minutes
- Alert on downtime > 2 minutes

### Error Budgets

Define acceptable error rates:

```
Daily Error Budget:
- Total errors: < 100 per 1000 users
- Auth errors: < 5 per 1000 users
- Critical errors: 0 (immediate alert)
- 5xx errors: < 1% of requests
```

### Performance Budgets

Define performance targets:

```
Performance Budget:
- Page load time: < 3s (3G)
- Time to Interactive: < 5s
- First Contentful Paint: < 1.5s
- Bundle size: < 500 KB (compressed)
- Lighthouse score: > 90
```

### Regular Reviews

**Weekly:**
- Review error trends in Sentry
- Check performance regressions
- Identify top 5 errors
- Update error budget status

**Monthly:**
- Analyze user session replays
- Review slow operations
- Update alert thresholds
- Clean up resolved issues

**Quarterly:**
- Audit Sentry quota usage
- Review and update error categories
- Assess monitoring coverage
- Update documentation

---

## Error Handling Patterns

### Retry Logic with Monitoring

```typescript
import { reportRetryExhausted } from "@/core/services/observability";
import pRetry from "p-retry";

const fetchWithRetry = async (url: string) => {
  try {
    return await pRetry(
      async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      },
      {
        retries: 3,
        onFailedAttempt: (error) => {
          console.log(`Attempt ${error.attemptNumber} failed`);
        },
      }
    );
  } catch (error) {
    // All retries exhausted
    reportRetryExhausted(error as Error, {
      attempts: 3,
      url,
      operation: "fetchData",
    });
    throw error;
  }
};
```

### Graceful Degradation

```typescript
import { reportError } from "@/core/services/observability";

const loadFeature = async () => {
  try {
    return await import("./expensive-feature");
  } catch (error) {
    reportError(error as Error, "warn", "unknown", {
      operation: "loadFeature",
      skipNotification: true, // Don't show toast
    });

    // Fallback to basic version
    return import("./basic-feature");
  }
};
```

### Error Boundaries per Feature

```typescript
// Per-feature error boundaries
<Sentry.ErrorBoundary
  fallback={<FeatureFallback />}
  beforeCapture={(scope) => {
    scope.setTag("feature", "chat");
    scope.setLevel("error");
  }}
>
  <ChatFeature />
</Sentry.ErrorBoundary>
```

---

## Debugging Production Issues

### Sentry Dashboard Workflow

1. **Navigate to Issues:**
   - Go to **Sentry Dashboard → Issues**
   - Filter by environment: Production
   - Sort by: "Last Seen" or "Events"

2. **Investigate Error:**
   - Click issue to view details
   - Check breadcrumbs for user actions leading to error
   - Review stack trace (source mapped)
   - Check user context and environment

3. **View Session Replay:**
   - Click "Replays" tab
   - Watch video of user session when error occurred
   - Identify exact steps to reproduce

4. **Resolve or Ignore:**
   - Fix bug and deploy
   - Mark issue as "Resolved"
   - Or "Ignore" if not actionable

### Using Breadcrumbs

Breadcrumbs show the trail leading to an error:

```typescript
// Automatic breadcrumbs
Sentry.addBreadcrumb({
  category: "ui",
  message: "Button clicked",
  level: "info",
});

// Manual breadcrumbs
logger.info("Processing file", { fileName: file.name });
logger.debug("Validation passed", { recordCount: 100 });
```

**Breadcrumb Example in Sentry:**
```
1. [ui] User clicked "Upload File"
2. [api] Started file upload (fileName: document.pdf)
3. [validation] Validation passed (fileSize: 2.3MB)
4. [network] POST /api/upload (duration: 2341ms)
5. [error] Upload failed: Network timeout
```

### Finding Related Errors

**Group Similar Errors:**
- Sentry automatically groups similar errors
- Fingerprinting based on stack trace
- Override with custom fingerprinting if needed

**Search by Tags:**
```
# Search syntax examples
operation:fetchThreads
user.id:user_123
component:MessageList
category:api
```

---

## Monitoring Tools Overview

### Sentry Dashboard Sections

**Issues:**
- All errors grouped by similarity
- Filter by date, environment, status
- Sort by frequency or recency

**Performance:**
- Transaction overview
- Slow operations
- Database query performance (if instrumented)

**Replays:**
- Video recordings of user sessions
- 10% of normal sessions
- 100% of sessions with errors

**Releases:**
- Track errors per release version
- Compare error rates between versions
- Link commits to releases

**Alerts:**
- Configure automatic alerts
- Slack, email, PagerDuty integrations
- Custom alert rules

### Local Monitoring

**Browser Console:**
```typescript
// Check error stats
import { getErrorStats } from "@/core/services/observability";

console.log(getErrorStats());
// {
//   totalErrors: 5,
//   errorsByCategory: { api: 3, ui: 2 },
//   errorsBySeverity: { error: 4, warn: 1 },
//   recentErrors: [...]
// }
```

**Network Tab:**
- Monitor API request timing
- Check failed requests
- Verify retry behavior

**Sentry DevTools:**
```bash
# Enable Sentry debug mode
localStorage.setItem('sentryDebug', 'true');
```

---

## Troubleshooting Monitoring Issues

### Errors Not Appearing in Sentry

**Check DSN Configuration:**
```bash
# Verify environment variable
echo $VITE_SENTRY_DSN

# Check initialization in browser console
localStorage.getItem('sentryHub')
```

**Verify Initialization:**
```typescript
// Add to src/main.tsx
if (env.SENTRY_DSN) {
  console.log("Sentry initialized:", env.SENTRY_DSN);
  Sentry.init({...});
} else {
  console.warn("Sentry not initialized - no DSN");
}
```

**Check Browser Network:**
- Open browser DevTools → Network
- Look for requests to `sentry.io`
- Check for CORS or network errors

### Source Maps Not Working

**Verify Upload:**
```bash
# Check if source maps uploaded
npx @sentry/cli releases files agent-chat-ui@{version} list

# If empty, upload manually
npx @sentry/cli sourcemaps upload \
  --org=your-org \
  --project=your-project \
  --release=agent-chat-ui@{version} \
  ./dist
```

**Check Auth Token Permissions:**
- Token needs: `project:read`, `project:releases`, `org:read`
- Regenerate token if permissions changed

**Verify Build Process:**
```bash
# Check if source maps generated
ls -la dist/assets/*.map

# Should see .js.map files before Sentry plugin runs
```

### High Quota Usage

**Reduce Sample Rates:**
```typescript
Sentry.init({
  tracesSampleRate: 0.1,           // 10% of transactions
  replaysSessionSampleRate: 0.01,  // 1% of sessions
  replaysOnErrorSampleRate: 1.0,   // Keep 100% of error sessions
});
```

**Filter Errors:**
```typescript
Sentry.init({
  beforeSend(event) {
    // Filter out known non-actionable errors
    if (event.exception?.values?.[0]?.value?.includes("ResizeObserver")) {
      return null; // Don't send to Sentry
    }
    return event;
  },
});
```

**Ignore Specific Errors:**
```typescript
Sentry.init({
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    /Extension context invalidated/,
  ],
});
```

---

## Related Documentation

**See Also:**
- [Build Process](./24-build-process.md) - Source map generation
- [Deployment](./25-deployment.md) - Production deployment
- [Error Handling](./17-error-handling.md) - Application error handling
- [Configuration](./02-configuration.md) - Environment setup
