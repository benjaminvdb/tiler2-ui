# Configuration Guide

This document provides comprehensive information about configuring the Tiler2 UI application.

## Environment Variables

Environment variables are defined in `.env.local` (development) or set in your deployment platform (production).

### Required Variables

These variables MUST be set for the application to function:

#### `VITE_AUTH0_DOMAIN`

Your Auth0 tenant domain.

**Format:** `your-tenant.auth0.com` or `your-tenant.us.auth0.com`

**Example:**
```bash
VITE_AUTH0_DOMAIN=acme-corp.auth0.com
```

**How to find:** Auth0 Dashboard → Applications → Your App → Settings → Domain

---

#### `VITE_AUTH0_CLIENT_ID`

Your Auth0 application client ID.

**Format:** Alphanumeric string

**Example:**
```bash
VITE_AUTH0_CLIENT_ID=xYz123AbC456DeF789GhI012
```

**How to find:** Auth0 Dashboard → Applications → Your App → Settings → Client ID

---

#### `VITE_APP_BASE_URL`

The base URL where your application is hosted.

**Format:** Full URL including protocol

**Examples:**
```bash
# Development
VITE_APP_BASE_URL=http://localhost:3000

# Production
VITE_APP_BASE_URL=https://app.example.com
```

**Usage:** Used for Auth0 callbacks, redirects, and generating absolute URLs.

**IMPORTANT:** This MUST match the URL in Auth0's Allowed Callback URLs.

---

### Optional Variables

These variables have default values but can be customized:

#### `VITE_API_URL`

The URL of your LangGraph API server.

**Default:** `http://localhost:2024`

**Format:** Full URL including protocol

**Examples:**
```bash
# Local development
VITE_API_URL=http://localhost:2024

# Production
VITE_API_URL=https://api.example.com
```

**Usage:** All API requests are sent to this URL.

---

#### `VITE_ASSISTANT_ID`

The default graph/assistant ID to use for new threads.

**Default:** `"assistant"`

**Format:** String (matches your LangGraph graph ID)

**Examples:**
```bash
VITE_ASSISTANT_ID=assistant
VITE_ASSISTANT_ID=sustainability-agent
VITE_ASSISTANT_ID=my-custom-graph
```

**Usage:** Used when creating new threads without a specific workflow.

---

#### `VITE_AUTH0_AUDIENCE`

Auth0 API audience for API authorization.

**Default:** None (authentication only, no API authorization)

**Format:** String (typically a URL)

**Example:**
```bash
VITE_AUTH0_AUDIENCE=https://api.example.com
```

**Usage:** Include this if your API requires audience validation in access tokens.

**How to find:** Auth0 Dashboard → APIs → Your API → Settings → Identifier

---

#### `VITE_SENTRY_DSN`

Sentry Data Source Name for error tracking.

**Default:** None (Sentry disabled)

**Format:** URL provided by Sentry

**Example:**
```bash
VITE_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7890123
```

**Usage:** Enables error tracking and performance monitoring in production.

**How to find:** Sentry Dashboard → Settings → Projects → Your Project → Client Keys (DSN)

---

#### `VITE_APP_VERSION`

Application version number.

**Default:** Automatically set from `package.json` during build

**Format:** Semantic version string

**Example:**
```bash
VITE_APP_VERSION=1.2.3
```

**Usage:** Displayed in error reports and used for version tracking.

**Note:** Typically set automatically by the build process; manual override rarely needed.

---

### Build-Time Variables

These variables are used during the build process (not at runtime):

#### `SENTRY_ORG`

Sentry organization slug for source map uploads.

**Example:**
```bash
SENTRY_ORG=my-organization
```

**Usage:** Required for uploading source maps to Sentry during production builds.

---

#### `SENTRY_PROJECT`

Sentry project slug for source map uploads.

**Example:**
```bash
SENTRY_PROJECT=tiler2-ui
```

**Usage:** Required for uploading source maps to Sentry during production builds.

---

#### `SENTRY_AUTH_TOKEN`

Sentry authentication token for source map uploads.

**Example:**
```bash
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

**Usage:** Required for uploading source maps to Sentry during production builds.

**Security:** Never commit this token to version control. Use environment variables or secrets management.

---

#### `LANGSMITH_API_KEY`

LangSmith API key for tracing and debugging (server-side).

**Example:**
```bash
LANGSMITH_API_KEY=your-langsmith-api-key
```

**Usage:** Used by the LangGraph server for tracing. Not used by the frontend.

**Note:** This is a server-side configuration, included here for completeness.

---

## Configuration Files

### Vite Configuration (`vite.config.ts`)

Location: `/home/user/tiler2-ui/vite.config.ts`

**Key settings:**

```typescript
export default defineConfig({
  // Path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/core": path.resolve(__dirname, "./src/core"),
    },
  },

  // Dev server
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:2024",
        changeOrigin: true,
      },
    },
  },

  // Build optimization
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["react-router"],
          ui: ["@radix-ui/react-avatar", /* ... */],
          markdown: ["react-markdown", /* ... */],
          langchain: ["@langchain/langgraph-sdk"],
        },
      },
    },
  },
});
```

**Customization:**

- Change `server.port` to use a different development port
- Modify `manualChunks` to adjust code splitting strategy
- Add additional `alias` entries for custom import paths

---

### TypeScript Configuration (`tsconfig.json`)

Location: `/home/user/tiler2-ui/tsconfig.json`

**Key settings:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/core/*": ["./src/core/*"]
    }
  }
}
```

**Strictness:** This project uses TypeScript in strict mode with additional checks enabled.

**NEVER disable these settings** unless absolutely necessary:
- `noImplicitAny` - Prevents implicit `any` types
- `strict` - Enables all strict type-checking options
- `noUnusedLocals` - Catches unused variables
- `noUnusedParameters` - Catches unused function parameters

---

### Tailwind Configuration (`tailwind.config.js`)

Location: `/home/user/tiler2-ui/tailwind.config.js`

**Key settings:**

```javascript
export default {
  darkMode: ["class"], // Dark mode enabled via class
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Custom color palette for sustainability theme
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        // ... more colors
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Source Serif 4", "serif"],
        mono: ["Comic Mono", "monospace"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwind-scrollbar"),
  ],
};
```

**Customization:**

- Modify `theme.extend.colors` to change the color palette
- Update `fontFamily` to use different fonts
- Add custom utility classes in `theme.extend`

**IMPORTANT:** Changes to Tailwind config require restarting the dev server.

---

### ESLint Configuration (`eslint.config.js`)

Location: `/home/user/tiler2-ui/eslint.config.js`

**Key rules:**

```javascript
export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  {
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
    },
  },
];
```

**Customization:** Avoid disabling rules unless necessary. These rules catch common bugs.

---

### Prettier Configuration (`prettier.config.js`)

Location: `/home/user/tiler2-ui/prettier.config.js`

**Settings:**

```javascript
export default {
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  printWidth: 80,
  tabWidth: 2,
  plugins: ["prettier-plugin-tailwindcss"],
};
```

**Customization:** Keep formatting consistent across the team. Avoid personal preference changes.

---

### Vercel Configuration (`vercel.json`)

Location: `/home/user/tiler2-ui/vercel.json`

**Key settings:**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**Purpose:**
- **Rewrites:** SPA routing - all routes serve `index.html`
- **Security Headers:** Protection against common attacks
- **Cache Headers:** Long-term caching for static assets

---

## Application Configuration (`app-config.ts`)

Location: `/home/user/tiler2-ui/src/core/config/app-config.ts`

This file centralizes environment variable access with type safety:

```typescript
export const appConfig = {
  auth: {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    redirectUri: `${import.meta.env.VITE_APP_BASE_URL}/`,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:2024",
  },
  assistant: {
    defaultId: import.meta.env.VITE_ASSISTANT_ID || "assistant",
  },
  sentry: {
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
  },
  app: {
    version: import.meta.env.VITE_APP_VERSION || "unknown",
    baseUrl: import.meta.env.VITE_APP_BASE_URL,
  },
};
```

**Usage:** Always import configuration from `app-config.ts`, never access `import.meta.env` directly:

```typescript
// ✅ CORRECT
import { appConfig } from "@/core/config/app-config";
const apiUrl = appConfig.api.baseUrl;

// ❌ WRONG
const apiUrl = import.meta.env.VITE_API_URL;
```

**Why?** Centralized configuration enables:
- Type safety
- Default values
- Easy testing with mocks
- Single source of truth

---

## Environment-Specific Configuration

### Development (`.env.local`)

```bash
VITE_AUTH0_DOMAIN=dev-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=dev-client-id
VITE_APP_BASE_URL=http://localhost:3000
VITE_API_URL=http://localhost:2024
VITE_ASSISTANT_ID=assistant
```

### Production (Vercel Environment Variables)

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
VITE_AUTH0_DOMAIN=prod-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=prod-client-id
VITE_APP_BASE_URL=https://app.example.com
VITE_API_URL=https://api.example.com
VITE_ASSISTANT_ID=assistant
VITE_AUTH0_AUDIENCE=https://api.example.com
VITE_SENTRY_DSN=https://abc@sentry.io/123
SENTRY_ORG=my-org
SENTRY_PROJECT=tiler2-ui
SENTRY_AUTH_TOKEN=***
```

**IMPORTANT:** Never commit `.env.local` to version control. It's in `.gitignore` by default.

---

## Configuration Best Practices

### Security

1. **Never commit secrets:** Use `.env.local` for local development
2. **Use environment-specific values:** Different credentials for dev/staging/prod
3. **Rotate tokens regularly:** Especially Sentry and API tokens
4. **Validate inputs:** All environment variables should be validated at startup

### Validation

Add validation in `app-config.ts`:

```typescript
function validateConfig() {
  const required = [
    "VITE_AUTH0_DOMAIN",
    "VITE_AUTH0_CLIENT_ID",
    "VITE_APP_BASE_URL",
  ];

  const missing = required.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

validateConfig();
```

### Documentation

1. **Document all variables:** Include purpose, format, and examples
2. **Keep .env.example updated:** Reflect all available variables
3. **Comment unusual values:** Explain why specific values are needed

---

## Troubleshooting

### Changes Not Reflected

**Issue:** Changed environment variable but app still uses old value

**Solution:**
1. Restart the dev server (`pnpm dev`)
2. Hard refresh browser (Cmd/Ctrl + Shift + R)
3. Clear browser cache if using service workers

### Build Fails with Missing Variables

**Issue:** Production build fails with "undefined environment variable"

**Solution:**
1. Verify all required variables are set in deployment platform
2. Check for typos in variable names (case-sensitive)
3. Ensure `VITE_` prefix for client-side variables

### Auth0 Configuration Errors

**Issue:** "Callback URL mismatch" or "Unauthorized" errors

**Solution:**
1. Verify `VITE_APP_BASE_URL` matches Auth0 Allowed Callback URLs
2. Check `VITE_AUTH0_DOMAIN` is correct
3. Ensure `VITE_AUTH0_CLIENT_ID` matches your Auth0 application

---

**Next:** [Development Workflow](./03-development-workflow.md)
