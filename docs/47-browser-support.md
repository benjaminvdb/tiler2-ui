# Browser Support

This document outlines supported browsers, required features, and compatibility considerations for the application.

## Overview

The application targets modern browsers with ES2020+ support. No legacy browser support (IE11) is provided.

## Supported Browsers

### Desktop Browsers

#### ✅ Fully Supported

**Chrome/Edge (Chromium)**
- **Minimum version:** 90+
- **Recommended:** Latest stable
- **Testing priority:** High (primary browser)

**Firefox**
- **Minimum version:** 88+
- **Recommended:** Latest stable
- **Testing priority:** Medium

**Safari**
- **Minimum version:** 14+
- **Recommended:** Latest stable
- **Testing priority:** Medium
- **Note:** May require additional testing for webkit-specific issues

**Brave**
- **Minimum version:** Based on Chromium 90+
- **Recommendation:** Latest stable
- **Testing priority:** Low (Chromium-based)

#### ⚠️ Limited Support

**Opera**
- **Minimum version:** Based on Chromium 76+
- **Testing:** Not regularly tested
- **Note:** Should work due to Chromium base

**Vivaldi**
- **Minimum version:** Based on Chromium
- **Testing:** Not regularly tested
- **Note:** Should work due to Chromium base

#### ❌ Not Supported

**Internet Explorer 11**
- **Status:** NOT SUPPORTED
- **Reason:** Lacks ES2020 features, no module support
- **Alternative:** Direct users to modern browsers

**Legacy Edge (EdgeHTML)**
- **Status:** NOT SUPPORTED
- **Reason:** Discontinued by Microsoft
- **Alternative:** Use Chromium-based Edge

### Mobile Browsers

#### ✅ Fully Supported

**Safari iOS**
- **Minimum version:** iOS 14+
- **Recommended:** Latest iOS
- **Testing priority:** High

**Chrome Android**
- **Minimum version:** Chrome 90+
- **Recommended:** Latest stable
- **Testing priority:** High

**Samsung Internet**
- **Minimum version:** 14+
- **Testing priority:** Low
- **Note:** Chromium-based, should work

#### ⚠️ Limited Support

**Firefox Android**
- **Minimum version:** 88+
- **Testing:** Limited
- **Note:** Core functionality should work

**Opera Mobile**
- **Minimum version:** Chromium 76+
- **Testing:** Not regularly tested

## Required Browser Features

### ES2020+ Features

The application requires these JavaScript features:

```typescript
// ES2020
import.meta                    // ✓ Vite uses import.meta.env
BigInt                         // ✓ If needed
Promise.allSettled            // ✓ For parallel requests
globalThis                    // ✓ Universal global object
Optional chaining (?.)        // ✓ Used extensively
Nullish coalescing (??)       // ✓ Used extensively

// ES2021
String.prototype.replaceAll   // ✓ String manipulation
Promise.any                    // ✓ If needed

// ES2022
Top-level await               // ✓ Vite supports
```

### Browser APIs

**Required:**
- `fetch` - Network requests
- `localStorage` - Token storage
- `sessionStorage` - Session data
- `WebSocket` / `EventSource` - Real-time streaming
- `History API` - Client-side routing
- `URL API` - URL parsing
- `FormData` - File uploads
- `FileReader` - File reading
- `Blob` - File handling

**Optional but recommended:**
- `IntersectionObserver` - Lazy loading
- `ResizeObserver` - Responsive components
- `MutationObserver` - DOM change detection

### CSS Features

**Required:**
- CSS Grid - Layout
- Flexbox - Component layout
- CSS Variables - Theming
- CSS Transforms - Animations
- CSS Transitions - Smooth effects

**Used from Tailwind:**
- `clamp()` - Responsive sizing
- `min()` / `max()` - Responsive calculations
- `@supports` - Feature detection

## Browser-Specific Considerations

### Safari

**Known Issues:**

1. **Date formatting differences**
```typescript
// Safari may format dates differently
const date = new Date().toLocaleDateString('en-US');
// Use Intl.DateTimeFormat for consistency
```

2. **Back/Forward cache (bfcache)**
```typescript
// Handle page restore
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page restored from cache, refresh data
    window.location.reload();
  }
});
```

3. **Touch event handling**
```typescript
// Safari requires passive event listeners for better performance
element.addEventListener('touchstart', handler, { passive: true });
```

**Webkit Prefixes:**

Most webkit prefixes are handled by Tailwind/autoprefixer, but be aware:
- `-webkit-appearance`
- `-webkit-overflow-scrolling`

### Firefox

**Known Issues:**

1. **Scrollbar styling**
```css
/* Firefox uses different scrollbar properties */
scrollbar-width: thin;
scrollbar-color: #888 #f1f1f1;

/* Chrome/Safari use ::-webkit-scrollbar */
::-webkit-scrollbar { /* ... */ }
```

2. **Flex gap older versions**
- Flex gap support in Firefox 63+
- Tailwind handles this automatically

### Mobile Safari

**Specific Issues:**

1. **100vh issue**
```css
/* Mobile Safari's 100vh includes address bar */
/* Use dvh (dynamic viewport height) if supported */
.full-height {
  height: 100vh;
  height: 100dvh; /* Fallback for modern browsers */
}
```

2. **Input zoom on focus**
```css
/* Prevent zoom on input focus (if font-size < 16px) */
input {
  font-size: 16px; /* Minimum to prevent zoom */
}
```

3. **Touch scroll momentum**
```css
/* Enable smooth scrolling on iOS */
.scrollable {
  -webkit-overflow-scrolling: touch;
}
```

## Feature Detection

### Using @supports

```css
/* Detect CSS feature support */
@supports (display: grid) {
  .container {
    display: grid;
  }
}

@supports not (display: grid) {
  .container {
    display: flex;
  }
}
```

### JavaScript Feature Detection

```typescript
// Check if feature exists before using
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(callback);
  // Use observer
} else {
  // Fallback behavior
}

// EventSource for SSE
if ('EventSource' in window) {
  // Use SSE
} else {
  console.error('Browser does not support Server-Sent Events');
}
```

## Polyfills

### Current Status

**No polyfills included** - The application targets modern browsers that support all required features natively.

### If Polyfills Needed

To support older browsers, add polyfills:

```bash
# Install core-js for ES features
pnpm add core-js

# Install regenerator-runtime for async/await
pnpm add regenerator-runtime
```

```typescript
// src/main.tsx - at the very top
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

**Not recommended:** Polyfills increase bundle size significantly. Better to drop old browser support.

## Testing Strategy

### Browser Testing Checklist

- [ ] Chrome (latest) - Primary testing
- [ ] Firefox (latest) - Secondary testing
- [ ] Safari (latest) - macOS testing
- [ ] Safari iOS (latest) - Mobile testing
- [ ] Chrome Android - Mobile testing
- [ ] Edge (latest) - Optional validation

### Testing Tools

**Manual Testing:**
- Real devices (iPhone, Android)
- Browser DevTools device emulation
- Safari Technology Preview (pre-release)

**Automated Testing (when added):**
```typescript
// Playwright supports multiple browsers
import { chromium, firefox, webkit } from '@playwright/test';

test('works in all browsers', async () => {
  for (const browserType of [chromium, firefox, webkit]) {
    const browser = await browserType.launch();
    // Test...
  }
});
```

### Responsive Testing

```bash
# Test various viewport sizes
# Mobile: 375x667 (iPhone SE)
# Tablet: 768x1024 (iPad)
# Desktop: 1920x1080 (Full HD)
```

## Browser Compatibility Checks

### Build Time

TypeScript target in `/home/user/tiler2-ui/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

**Why ES2020:** Balances modern features with browser support.

### Vite Configuration

From `/home/user/tiler2-ui/vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    target: 'es2020', // Matches tsconfig
  },
});
```

## User Agent Detection

### When to Use

**Generally avoid user agent detection.** Use feature detection instead.

**Exceptions:**
- Showing browser-specific download links
- Logging analytics
- Debugging specific browser issues

```typescript
// Feature detection (preferred)
if ('serviceWorker' in navigator) {
  // Use service worker
}

// User agent detection (avoid)
const isFirefox = navigator.userAgent.includes('Firefox');
// Fragile and unreliable
```

## Progressive Enhancement

### Approach

Build for modern browsers first, then handle edge cases:

1. **Core functionality** - Works in all supported browsers
2. **Enhanced features** - Use modern APIs with fallbacks
3. **Optimization** - Use latest features where available

### Example

```typescript
// Enhanced: Use Intersection Observer for lazy loading
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        loadImage(entry.target);
      }
    });
  });
} else {
  // Fallback: Load all images immediately
  loadAllImages();
}
```

## Accessibility Across Browsers

All supported browsers handle these accessibility features:

- **Screen reader support** - ARIA attributes
- **Keyboard navigation** - Tab, Enter, Space, Arrow keys
- **Focus management** - Focus visible, focus trap
- **High contrast mode** - Respects OS settings
- **Reduced motion** - Respects prefers-reduced-motion

```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Known Limitations

### Server-Sent Events (SSE)

**Safari:**
- 6 connection limit per domain
- May close connections on background tabs

**Workaround:**
```typescript
// Detect page visibility
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause streaming
  } else {
    // Resume streaming
  }
});
```

### LocalStorage

**All browsers:**
- 5-10 MB limit (varies by browser)
- Synchronous API (blocks main thread)
- Not available in incognito/private mode (Safari)

**Check availability:**
```typescript
function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
```

### WebSocket/EventSource

**Corporate networks:**
- May block WebSocket connections
- Proxy servers may interfere with SSE

**Fallback:** Not implemented, but could add HTTP polling.

## Updating Browser Requirements

When updating minimum browser versions:

1. **Analyze usage data** - Check which browsers users actually use
2. **Evaluate benefits** - What features does dropping support enable?
3. **Communicate changes** - Notify users in advance
4. **Provide alternatives** - Suggest modern browsers
5. **Update documentation** - Document new requirements

## Related Documentation

- See [46-dependencies.md](/home/user/tiler2-ui/docs/46-dependencies.md) for dependency requirements
- See [24-build-process.md](/home/user/tiler2-ui/docs/24-build-process.md) for build configuration
- See [23-accessibility.md](/home/user/tiler2-ui/docs/23-accessibility.md) for accessibility features

---

**Next:** [48-glossary.md](/home/user/tiler2-ui/docs/48-glossary.md)
