# Common Issues

This document provides solutions to frequently encountered problems during development and deployment.

## Auth0 Configuration Issues

### Issue: Redirect Loop After Login

**Symptoms:**
- After clicking login, browser redirects endlessly
- Console shows "Callback URL mismatch" error
- URL alternates between app and Auth0

**Causes:**
1. Callback URL not configured in Auth0
2. Wrong base URL in environment variables
3. CORS configuration issue

**Solutions:**

```bash
# 1. Verify callback URL in Auth0 Dashboard
# Go to: Auth0 Dashboard → Applications → Settings → Allowed Callback URLs
# Should include:
http://localhost:3000
https://your-production-domain.com

# 2. Check environment variable
# .env.local
VITE_APP_BASE_URL=http://localhost:3000  # Must match exactly

# 3. Check Auth0 configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com  # No https://
VITE_AUTH0_CLIENT_ID=your-client-id
```

**Why:** Auth0 validates redirect URLs for security. Mismatches cause redirect loops.

### Issue: "Invalid State" Error

**Symptoms:**
- Login redirects back with error
- Console shows "State does not match"

**Cause:** Browser cache or cookie issues

**Solution:**
```bash
# 1. Clear browser cache and cookies
# 2. Clear localStorage
localStorage.clear();

# 3. Try incognito/private browsing

# 4. Check Auth0 application settings
# Ensure "Refresh Token Rotation" is enabled
```

### Issue: Token Expired After Page Refresh

**Symptoms:**
- User logged out after page refresh
- Need to re-authenticate frequently

**Cause:** Refresh tokens not enabled

**Solution:**

```typescript
// In Auth0Provider configuration
<Auth0Provider
  useRefreshTokens={true}  // Enable refresh tokens
  cacheLocation="localstorage"  // Persist across refreshes
>
```

**Why:** Refresh tokens maintain sessions across page reloads.

## Build Failures

### Issue: TypeScript Errors During Build

**Symptoms:**
```bash
pnpm build
# Error: Type 'string | undefined' is not assignable to type 'string'
```

**Cause:** Strict TypeScript configuration

**Solution:**

```typescript
// Bad - may be undefined
const apiUrl = import.meta.env.VITE_API_URL;

// Good - use validated env
import { env } from "@/env";
const apiUrl = env.API_URL;

// Or provide default
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Or use optional chaining
const apiUrl = import.meta.env.VITE_API_URL ?? "default";
```

### Issue: "Cannot find module '@/...'"

**Symptoms:**
```bash
Error: Cannot find module '@/shared/types'
```

**Cause:** Path alias not configured

**Solution:**

Check `/home/user/tiler2-ui/tsconfig.json` and `/home/user/tiler2-ui/vite.config.ts`:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/core/*": ["./src/core/*"]
    }
  }
}
```

```typescript
// vite.config.ts
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/core": path.resolve(__dirname, "./src/core"),
    },
  },
});
```

### Issue: Out of Memory During Build

**Symptoms:**
```bash
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Cause:** Large bundle or insufficient memory

**Solution:**

```bash
# Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 pnpm build

# Or add to package.json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
  }
}

# Analyze bundle size
pnpm analyze

# Check for large dependencies
pnpm why <package-name>
```

## Runtime Errors

### Issue: "Failed to fetch" in Production

**Symptoms:**
- Works in development
- Fails in production with network error
- Console shows CORS or network error

**Causes:**
1. Wrong API URL
2. CORS not configured
3. Network connectivity

**Solution:**

```bash
# 1. Check production environment variables
# Vercel/Netlify → Environment Variables
VITE_API_URL=https://api.production.com  # Not localhost!

# 2. Verify API is accessible
curl https://api.production.com/health

# 3. Check CORS headers on API
# API must include:
Access-Control-Allow-Origin: https://your-app.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

### Issue: Streaming Not Working

**Symptoms:**
- Messages don't appear in real-time
- Stuck on loading
- Network tab shows request "pending" forever

**Causes:**
1. Async iteration syntax error
2. Network timeout
3. Backend not sending SSE format

**Solution:**

```typescript
// ✅ Correct - async iteration
for await (const chunk of stream) {
  console.log("Received chunk:", chunk);
  processChunk(chunk);
}

// ❌ Wrong - missing await
for (const chunk of stream) {
  // Won't work
}

// Check network timeout
const response = await fetch(url, {
  signal: AbortSignal.timeout(30000), // 30 second timeout
});

// Verify SSE format from backend
// Should see in Network tab → EventStream:
// event: messages
// data: {"type":"ai","content":"..."}
```

### Issue: Infinite Re-render Loop

**Symptoms:**
- Browser becomes unresponsive
- Console floods with warnings
- "Maximum update depth exceeded" error

**Cause:** useEffect or state update causing loop

**Solution:**

```typescript
// ❌ Bad - causes infinite loop
useEffect(() => {
  setMessages([...messages, newMessage]);
  // messages changes → effect runs → messages changes → ...
});

// ✅ Good - proper dependency array
useEffect(() => {
  if (shouldAddMessage) {
    setMessages([...messages, newMessage]);
  }
}, [shouldAddMessage]); // Only run when this changes

// ✅ Better - functional update
useEffect(() => {
  if (shouldAddMessage) {
    setMessages(prev => [...prev, newMessage]);
  }
}, [shouldAddMessage, newMessage]);
```

## Network Issues

### Issue: 401 Unauthorized

**Symptoms:**
- API calls fail with 401
- User appears logged in
- Token seems valid

**Solution:**

```typescript
// Check token in localStorage
const token = localStorage.getItem("@@auth0spajs@@::...");

// Verify token hasn't expired
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently();

// Check if audience is configured
// .env.local
VITE_AUTH0_AUDIENCE=https://your-api-identifier

// Ensure API expects same audience
```

### Issue: 429 Rate Limit Exceeded

**Symptoms:**
- Requests fail after several attempts
- "Too many requests" error

**Solution:**

```typescript
// Implement exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// Use with API calls
const result = await retryWithBackoff(() => sendMessage(content));
```

### Issue: CORS Preflight Failure

**Symptoms:**
- OPTIONS request fails
- Browser blocks actual request
- CORS error in console

**Cause:** Backend CORS configuration

**Solution (Backend):**

```typescript
// Backend needs to handle OPTIONS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://your-app.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.sendStatus(200);
});
```

**Frontend (temporary workaround):**

```typescript
// Use proxy in development (vite.config.ts)
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

## Performance Issues

### Issue: Slow Initial Load

**Symptoms:**
- First page load takes >3 seconds
- Large bundle size
- Many network requests

**Solution:**

```bash
# 1. Analyze bundle
pnpm analyze

# 2. Check for large dependencies
# Look for opportunities to:
# - Replace with smaller alternatives
# - Dynamic import non-critical code
# - Remove unused dependencies

# 3. Lazy load routes
const ThreadView = lazy(() => import('./features/thread/thread-view'));

# 4. Enable code splitting (already configured)
# Check vite.config.ts manualChunks

# 5. Optimize images
# - Use WebP format
# - Add width/height attributes
# - Lazy load images
```

### Issue: Memory Leak

**Symptoms:**
- Page becomes slower over time
- Browser memory increases continuously
- Eventual crash on long usage

**Cause:** Event listeners or subscriptions not cleaned up

**Solution:**

```typescript
// ✅ Clean up event listeners
useEffect(() => {
  const handler = () => console.log('resize');
  window.addEventListener('resize', handler);

  return () => {
    window.removeEventListener('resize', handler); // Cleanup
  };
}, []);

// ✅ Clean up async operations
useEffect(() => {
  let cancelled = false;

  async function fetchData() {
    const data = await fetch('/api/data');
    if (!cancelled) {
      setData(data);
    }
  }

  fetchData();

  return () => {
    cancelled = true; // Prevent state update after unmount
  };
}, []);

// ✅ Clean up intervals
useEffect(() => {
  const interval = setInterval(() => {
    // ...
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

### Issue: Slow Component Rendering

**Symptoms:**
- UI feels sluggish
- Typing has noticeable delay
- Scrolling is janky

**Solution:**

```typescript
// 1. Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  // ...
});

// 2. Optimize re-renders with useMemo
const sortedMessages = useMemo(() => {
  return messages.sort((a, b) => a.timestamp - b.timestamp);
}, [messages]);

// 3. Use useCallback for event handlers
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);

// 4. Virtual scrolling for long lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={messages.length}
  itemSize={100}
>
  {({ index }) => <Message message={messages[index]} />}
</FixedSizeList>
```

## Deployment Issues

### Issue: Build Works Locally But Fails in CI

**Symptoms:**
- `pnpm build` succeeds locally
- Fails in GitHub Actions or Vercel
- Different error in CI

**Causes:**
1. Node version mismatch
2. Missing environment variables
3. Different package versions

**Solution:**

```yaml
# .github/workflows/deploy.yml
- uses: actions/setup-node@v4
  with:
    node-version: 20  # Match local version

# package.json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}

# Ensure lockfile is committed
git add pnpm-lock.yaml
git commit -m "Add lockfile"
```

### Issue: Environment Variables Not Working in Production

**Symptoms:**
- Variables undefined in production
- Works in development

**Cause:** Variables not set in deployment platform

**Solution:**

```bash
# Vercel
# Dashboard → Project → Settings → Environment Variables
# Add all VITE_* variables

# Check build logs for validation errors
# Look for: "Environment validation failed"

# If using skip validation, ensure variables are available at runtime
VITE_SKIP_ENV_VALIDATION=true
```

## File Upload Issues

### Issue: Large Files Fail to Upload

**Symptoms:**
- Small files work
- Large files timeout or fail
- No error message

**Cause:** Size limits or timeout

**Solution:**

```typescript
// 1. Check file size limit
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}

// 2. Increase timeout for large files
const response = await fetch(url, {
  method: 'POST',
  body: formData,
  signal: AbortSignal.timeout(60000), // 60 seconds
});

// 3. Show progress for large uploads
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', (e) => {
  const percent = (e.loaded / e.total) * 100;
  setProgress(percent);
});
```

### Issue: Image Preview Not Showing

**Symptoms:**
- Upload succeeds
- Preview doesn't appear
- No error in console

**Cause:** Base64 encoding or URL format

**Solution:**

```typescript
// ✅ Correct - create blob URL
const previewUrl = URL.createObjectURL(file);

// Cleanup when done
useEffect(() => {
  return () => URL.revokeObjectURL(previewUrl);
}, [previewUrl]);

// Or use FileReader for base64
const reader = new FileReader();
reader.onload = (e) => {
  setPreview(e.target.result); // data:image/png;base64,...
};
reader.readAsDataURL(file);
```

## Getting Help

If your issue isn't listed:

1. **Check browser console** for error messages
2. **Check Network tab** for failed requests
3. **Search existing issues** on GitHub
4. **Enable debug logging** (if available)
5. **Create minimal reproduction** of the issue
6. **Open GitHub issue** with details

### Creating Good Bug Reports

Include:
- **What you expected** to happen
- **What actually happened**
- **Steps to reproduce**
- **Environment details** (browser, OS, Node version)
- **Error messages** (full stack trace)
- **Screenshots** (if UI issue)

## Related Documentation

- See [39-debugging.md](/home/user/tiler2-ui/docs/39-debugging.md) for debugging strategies
- See [44-faq.md](/home/user/tiler2-ui/docs/44-faq.md) for common questions
- See [17-error-handling.md](/home/user/tiler2-ui/docs/17-error-handling.md) for error patterns
- See [41-security.md](/home/user/tiler2-ui/docs/41-security.md) for security issues

---

**Next:** [44-faq.md](/home/user/tiler2-ui/docs/44-faq.md)
