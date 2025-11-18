# Build Process

## Overview

The build process transforms TypeScript and React source code into optimized, production-ready static assets using Vite. This guide explains the build configuration, optimization strategies, and troubleshooting steps.

**Key Technologies:**
- **Vite**: Lightning-fast build tool with native ESM support
- **TypeScript**: Type-safe compilation with strict mode enabled
- **Rollup**: Under the hood bundler for production builds
- **Sentry**: Source map upload for error tracking
- **Bundle Analyzer**: Visualization of bundle composition

**Build Artifacts:** All production assets are output to `/home/user/tiler2-ui/dist/`

---

## Build Configuration

### Vite Configuration

The Vite configuration is defined in `/home/user/tiler2-ui/vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: "./dist/**",
        filesToDeleteAfterUpload: ["**/*.js.map"],
      },
      telemetry: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/core": path.resolve(__dirname, "./src/core"),
      "@/infrastructure": path.resolve(__dirname, "./src/infrastructure"),
    },
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: [
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            // ... more UI components
          ],
          markdown: [
            "react-markdown",
            "react-syntax-highlighter",
            "remark-gfm",
            // ... more markdown dependencies
          ],
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

**Why this configuration exists:**
- **React Plugin**: Enables Fast Refresh and JSX transformation
- **Path Aliases**: Simplifies imports and maintains clean code organization
- **Manual Chunks**: Optimizes caching by grouping dependencies that change together
- **Source Maps**: Enables debugging production errors with readable stack traces
- **Visualizer**: Helps identify bundle size issues and optimization opportunities

---

## Build Command and Process

### Running the Build

```bash
# Production build
pnpm build

# Development build with type checking
pnpm check
```

### Build Script Breakdown

From `/home/user/tiler2-ui/package.json`:

```json
{
  "scripts": {
    "build": "VITE_APP_VERSION=$(node -p \"require('./package.json').version\") tsc && vite build",
    "check": "tsc --noEmit"
  }
}
```

**Build Process Steps:**

1. **Extract Version**: `VITE_APP_VERSION=$(node -p \"require('./package.json').version\")`
   - Reads version from package.json
   - Sets as environment variable for Sentry release tracking
   - Available in code as `env.APP_VERSION`

2. **TypeScript Compilation**: `tsc`
   - Type-checks all TypeScript files
   - Does NOT emit JavaScript (Vite handles that)
   - Fails build on type errors
   - Uses strict mode settings from `tsconfig.json`

3. **Vite Build**: `vite build`
   - Bundles all source code
   - Applies optimizations (minification, tree-shaking)
   - Generates source maps
   - Creates code-split chunks
   - Outputs to `/home/user/tiler2-ui/dist/`

**Why separate type checking:**
- Vite focuses on fast builds, not exhaustive type checking
- TypeScript compiler ensures type safety before bundling
- Catches type errors that might slip through Vite's quick checks

---

## TypeScript Compilation

### TypeScript Configuration

Configuration from `/home/user/tiler2-ui/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noEmit": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/core/*": ["./src/core/*"],
      "@/infrastructure/*": ["./src/infrastructure/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "new_design", "dist"]
}
```

**Strict Mode Benefits:**
- **Type Safety**: Catches type errors at compile time
- **Code Quality**: Enforces best practices
- **Refactoring Confidence**: Safe code changes with compiler verification
- **Editor Support**: Better autocomplete and IntelliSense

**Key Settings:**
- `noEmit: true` - Vite handles code generation, not tsc
- `incremental: true` - Faster subsequent type checks
- `moduleResolution: "bundler"` - Optimized for Vite bundler
- `exactOptionalPropertyTypes: true` - Strict handling of optional properties

---

## Production Optimizations

### Minification

Vite automatically minifies JavaScript and CSS in production builds:

**JavaScript Minification:**
- Uses esbuild for ultra-fast minification
- Removes whitespace, comments, and debug code
- Shortens variable names
- Removes dead code

**CSS Minification:**
- Removes whitespace and comments
- Optimizes selectors
- Merges duplicate rules
- Removes unused styles (when configured)

**Configuration:**
```typescript
// vite.config.ts - minification is automatic
build: {
  minify: 'esbuild', // default, can also use 'terser'
}
```

### Tree-Shaking

Tree-shaking removes unused code from the final bundle:

**How It Works:**
1. Analyzes import/export statements
2. Identifies unused exports
3. Removes dead code from bundle
4. Reduces bundle size

**Example:**
```typescript
// If you only import { Button } from "@/shared/components"
// Only Button code is included, not other components

import { Button } from "@/shared/components/ui/button";
```

**Best Practices:**
- Use named imports instead of default exports
- Avoid side effects in module scope
- Use `/*#__PURE__*/` annotations for safe removal

### Code Splitting

Manual chunk configuration optimizes caching:

```typescript
manualChunks: {
  // React core - changes rarely
  react: ["react", "react-dom"],

  // Router - changes occasionally
  router: ["react-router-dom"],

  // UI components - moderate frequency
  ui: ["@radix-ui/react-avatar", "@radix-ui/react-dialog", /* ... */],

  // Markdown rendering - large but stable
  markdown: ["react-markdown", "remark-gfm", /* ... */],

  // LangChain - domain-specific, changes with features
  langchain: ["@langchain/core", "@langchain/langgraph", "@langchain/langgraph-sdk"],
}
```

**Benefits:**
- **Better Caching**: Vendor code cached separately from app code
- **Parallel Loading**: Browser downloads chunks simultaneously
- **Faster Updates**: Users only re-download changed chunks
- **Reduced Main Bundle**: Improves initial load time

**Output Structure:**
```
dist/
├── assets/
│   ├── index-[hash].js          # Main app code
│   ├── react-[hash].js           # React chunk
│   ├── router-[hash].js          # Router chunk
│   ├── ui-[hash].js              # UI components chunk
│   ├── markdown-[hash].js        # Markdown chunk
│   ├── langchain-[hash].js       # LangChain chunk
│   └── index-[hash].css          # Styles
└── index.html
```

---

## Source Maps

### Configuration

Source maps are enabled in production for Sentry error tracking:

```typescript
// vite.config.ts
build: {
  sourcemap: true, // Generate .js.map files
}
```

**Why source maps in production:**
- **Readable Stack Traces**: See original TypeScript code in error reports
- **Debugging**: Investigate production issues with actual source code
- **Security**: Maps are deleted after upload to Sentry

### Source Map Handling

1. **Generation**: Vite creates `.js.map` files during build
2. **Upload**: Sentry plugin uploads maps to Sentry servers
3. **Deletion**: Plugin deletes maps after successful upload
4. **Privacy**: Maps never deployed to public CDN

```typescript
sentryVitePlugin({
  sourcemaps: {
    assets: "./dist/**",
    filesToDeleteAfterUpload: ["**/*.js.map"], // Security: delete after upload
  },
})
```

---

## Bundle Analysis

### Visualizing Bundle Size

The `rollup-plugin-visualizer` generates an interactive bundle analysis:

```bash
# Build and generate stats
pnpm build

# View analysis
open dist/stats.html
```

### Configuration

```typescript
// vite.config.ts
visualizer({
  filename: "./dist/stats.html",
  open: false,          // Don't auto-open browser
  gzipSize: true,       // Show gzipped sizes
  brotliSize: true,     // Show Brotli compressed sizes
})
```

### Using the Analyzer

The visualizer shows:
- **Treemap**: Visual representation of bundle composition
- **Sizes**: Uncompressed, gzipped, and Brotli sizes
- **Dependencies**: Which packages contribute to bundle size
- **Chunks**: Size distribution across code-split chunks

**Optimization Tips:**
1. Identify large dependencies
2. Look for duplicate code
3. Find opportunities for code splitting
4. Remove unused dependencies

---

## Build Artifacts

### Output Directory Structure

```
/home/user/tiler2-ui/dist/
├── index.html                    # Entry point
├── assets/
│   ├── index-[hash].js           # Main app bundle
│   ├── react-[hash].js           # React vendor chunk
│   ├── router-[hash].js          # Router chunk
│   ├── ui-[hash].js              # UI components chunk
│   ├── markdown-[hash].js        # Markdown rendering chunk
│   ├── langchain-[hash].js       # LangChain SDK chunk
│   ├── index-[hash].css          # Compiled styles
│   └── [asset]-[hash].[ext]      # Images, fonts, etc.
└── stats.html                    # Bundle analysis (optional)
```

### File Naming Convention

**Hash-Based Naming:**
- Format: `[name]-[contenthash].[ext]`
- Example: `index-a3f4b2c1.js`
- Hash changes only when content changes
- Enables aggressive caching with cache busting

**Asset Types:**
- **JavaScript**: `.js` files (minified)
- **CSS**: `.css` files (minified)
- **Source Maps**: `.js.map` files (uploaded to Sentry, then deleted)
- **Static Assets**: Images, fonts with content-based hashes

### Cache Headers

Vercel automatically sets optimal cache headers:

```
# From vercel.json
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## Environment Variable Handling

### Build-Time vs Runtime

**Build-Time Variables:**
- Prefixed with `VITE_`
- Embedded in JavaScript bundle
- Cannot change after build
- Available in browser

**Example:**
```typescript
// src/env.ts
const clientSchema = z.object({
  VITE_AUTH0_DOMAIN: z.string().min(1),
  VITE_AUTH0_CLIENT_ID: z.string().min(1),
  VITE_API_URL: z.string().optional(),
  VITE_SENTRY_DSN: z.url().optional(),
});

export const env = createEnv();
```

### Environment Files

```bash
/home/user/tiler2-ui/
├── .env.example          # Template with all variables
├── .env.local            # Local development (gitignored)
├── .env.production       # Production overrides (gitignored)
└── .env.development      # Development overrides (gitignored)
```

**Load Order (later files override earlier):**
1. `.env`
2. `.env.local`
3. `.env.[mode]` (e.g., `.env.production`)
4. `.env.[mode].local`

### Using Environment Variables

```typescript
// Access validated environment variables
import { env } from "@/env";

console.log(env.AUTH0_DOMAIN);    // Type-safe access
console.log(env.API_URL);         // Optional variables handled
```

**Security:**
- Never put secrets in `VITE_` variables (they're public in browser)
- Use `.env.local` for sensitive local values
- Configure production variables in Vercel dashboard

---

## Sentry Source Map Upload

### Configuration

Sentry plugin automatically uploads source maps during production builds:

```typescript
// vite.config.ts
sentryVitePlugin({
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    assets: "./dist/**",
    filesToDeleteAfterUpload: ["**/*.js.map"],
  },
  telemetry: false,
})
```

### Required Environment Variables

```bash
# .env.production or Vercel environment
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_your-token-here
```

**Get Sentry Auth Token:**
1. Visit https://sentry.io/settings/account/api/auth-tokens/
2. Create new token with scopes: `project:read`, `project:releases`, `org:read`
3. Add to environment variables

### Upload Process

1. **Build Completes**: Vite generates source maps
2. **Create Release**: Sentry plugin creates release with version from `package.json`
3. **Upload Maps**: Uploads all `.js.map` files to Sentry
4. **Delete Maps**: Removes `.js.map` files from `dist/` for security
5. **Success**: Production bundle deployed without source maps

### Verification

Check Sentry dashboard:
1. Go to **Settings → Projects → [Your Project] → Source Maps**
2. Verify release version matches `package.json` version
3. Confirm source maps uploaded successfully

---

## Build Troubleshooting

### Type Errors During Build

**Problem:** Build fails with TypeScript errors

```bash
error TS2322: Type 'string | undefined' is not assignable to type 'string'.
```

**Solutions:**

1. **Fix Type Errors:**
   ```typescript
   // Bad
   const value: string = possiblyUndefined;

   // Good
   const value: string = possiblyUndefined ?? "default";
   ```

2. **Check Type Definitions:**
   ```bash
   pnpm install --save-dev @types/react @types/react-dom
   ```

3. **Verify tsconfig.json:**
   - Ensure `strict: true` is enabled
   - Check `paths` configuration matches actual structure

### Build Performance Issues

**Problem:** Build takes too long

**Solutions:**

1. **Enable Incremental TypeScript:**
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "incremental": true
     }
   }
   ```

2. **Reduce Source Map Quality:**
   ```typescript
   // vite.config.ts - for development builds
   build: {
     sourcemap: import.meta.env.PROD ? true : 'inline',
   }
   ```

3. **Clear Build Cache:**
   ```bash
   rm -rf dist node_modules/.vite
   pnpm install
   pnpm build
   ```

### Large Bundle Size

**Problem:** Bundle exceeds 1MB compressed

**Solutions:**

1. **Analyze Bundle:**
   ```bash
   pnpm build
   open dist/stats.html
   ```

2. **Code Split Large Dependencies:**
   ```typescript
   // Use dynamic imports for heavy features
   const HeavyComponent = lazy(() => import("./HeavyComponent"));
   ```

3. **Remove Unused Dependencies:**
   ```bash
   pnpm knip --production
   pnpm remove unused-package
   ```

4. **Optimize Markdown Dependencies:**
   ```typescript
   // Import only needed rehype/remark plugins
   import remarkGfm from "remark-gfm";
   // Instead of importing entire plugin package
   ```

### Sentry Upload Failures

**Problem:** Source maps not uploading to Sentry

**Errors:**
```
Error: Sentry CLI not configured correctly
```

**Solutions:**

1. **Verify Environment Variables:**
   ```bash
   echo $SENTRY_ORG
   echo $SENTRY_PROJECT
   echo $SENTRY_AUTH_TOKEN
   ```

2. **Check Token Permissions:**
   - Token needs: `project:read`, `project:releases`, `org:read`
   - Regenerate token if needed

3. **Manual Upload (Debug):**
   ```bash
   npx @sentry/cli sourcemaps upload \
     --org=your-org \
     --project=your-project \
     --auth-token=your-token \
     ./dist
   ```

### Cache Issues

**Problem:** Changes not reflected after deployment

**Solutions:**

1. **Verify Hash Changes:**
   ```bash
   ls -la dist/assets/
   # Hashes should differ from previous build
   ```

2. **Hard Refresh Browser:**
   - Chrome/Firefox: `Ctrl+Shift+R` / `Cmd+Shift+R`
   - Clear browser cache

3. **Check Vercel Cache:**
   - Redeploy from Vercel dashboard
   - Clear Vercel cache if available

### Environment Variable Issues

**Problem:** Environment variables not available in build

**Error:**
```
Environment validation failed
```

**Solutions:**

1. **Verify VITE_ Prefix:**
   ```bash
   # Wrong
   AUTH0_DOMAIN=...

   # Correct
   VITE_AUTH0_DOMAIN=...
   ```

2. **Check .env Files:**
   ```bash
   cat .env.local
   cat .env.production
   ```

3. **Skip Validation (Temporary):**
   ```bash
   VITE_SKIP_ENV_VALIDATION=true pnpm build
   ```

---

## Best Practices

### Development Workflow

1. **Type Check Before Building:**
   ```bash
   pnpm check && pnpm build
   ```

2. **Regular Bundle Analysis:**
   - Review `dist/stats.html` weekly
   - Track bundle size trends
   - Remove unused dependencies

3. **Test Production Builds Locally:**
   ```bash
   pnpm build
   pnpm preview
   # Visit http://localhost:4173
   ```

### Optimization Checklist

- [ ] Enable all TypeScript strict mode flags
- [ ] Configure manual chunks for vendor dependencies
- [ ] Generate source maps for production debugging
- [ ] Use dynamic imports for large features
- [ ] Remove unused dependencies with `knip`
- [ ] Compress images and assets
- [ ] Enable Brotli compression on CDN
- [ ] Set appropriate cache headers
- [ ] Monitor bundle size in CI/CD

### Performance Targets

**Bundle Size Targets:**
- Main bundle: < 200 KB (compressed)
- Total JavaScript: < 500 KB (compressed)
- Initial page load: < 3 seconds (3G)

**Build Time Targets:**
- Development: < 10 seconds
- Production: < 2 minutes
- Type checking: < 30 seconds

---

## Related Documentation

**Next:** [Deployment →](./25-deployment.md)

**See Also:**
- [Configuration](./02-configuration.md) - Environment variables
- [Development Workflow](./03-development-workflow.md) - Local development
- [Performance](./22-performance.md) - Runtime optimization
- [Monitoring](./26-monitoring.md) - Production observability
