# Environment Variables

This document describes best practices for managing environment variables and secrets securely.

## Overview

Environment variables configure the application for different environments (development, staging, production) without hardcoding sensitive values.

**Critical principle:** Never commit secrets to version control.

## Environment File Structure

### Files and Their Purpose

```
/home/user/tiler2-ui/
├── .env.example          # Template with descriptions (committed)
├── .env.local            # Local development secrets (NOT committed)
├── .env.development      # Development overrides (NOT committed)
├── .env.production       # Production overrides (NOT committed)
└── .gitignore            # Ensures secrets aren't committed
```

### .gitignore Configuration

```gitignore
# Environment files (secrets)
.env.local
.env*.local
.env.production
.env.development

# Safe to commit
!.env.example
```

**Why:** `.env.example` documents required variables without exposing secrets.

## Variable Naming Convention

### VITE_ Prefix

In Vite applications, client-accessible variables **must** use the `VITE_` prefix:

```bash
# ✅ Exposed to browser (client-side)
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_API_URL=https://api.example.com

# ❌ NOT exposed to browser (Vite client-only apps don't have server-side)
API_SECRET=secret-key  # Won't be accessible
```

**Why:** Vite only exposes variables with `VITE_` prefix to prevent accidental secret exposure.

### Naming Best Practices

```bash
# Good naming
VITE_AUTH0_DOMAIN          # Clear, descriptive
VITE_API_URL               # Obvious purpose
VITE_APP_BASE_URL          # Explicit

# Bad naming
VITE_DOMAIN                # Ambiguous
VITE_URL                   # Which URL?
VITE_X                     # Meaningless
```

## Managing Secrets

### What Are Secrets?

Secrets are sensitive values that should never be committed:
- API keys
- Authentication credentials
- Database passwords
- Private keys
- OAuth client secrets
- Encryption keys

### What Are NOT Secrets?

Non-sensitive configuration can be committed:
- API URLs (public endpoints)
- Feature flags
- Application names
- Public configuration

### Example .env.local

```bash
# ============================================================================
# LOCAL DEVELOPMENT - NEVER COMMIT THIS FILE
# ============================================================================

# Auth0 (Required)
VITE_AUTH0_DOMAIN=dev-abc123.auth0.com
VITE_AUTH0_CLIENT_ID=AbCdEf123456789
VITE_AUTH0_AUDIENCE=https://api.example.com

# Application
VITE_APP_BASE_URL=http://localhost:3000

# LangGraph
VITE_API_URL=http://localhost:2024
VITE_ASSISTANT_ID=agent

# Sentry (Optional)
VITE_SENTRY_DSN=https://abc@o123.ingest.sentry.io/456

# Build-time secrets (not prefixed with VITE_)
SENTRY_AUTH_TOKEN=sntrys_secret_token_here
```

## Environment Variable Validation

### Runtime Validation with Zod

From `/home/user/tiler2-ui/src/env.ts`:

```typescript
import { z } from "zod";

const clientSchema = z.object({
  VITE_AUTH0_DOMAIN: z.string().min(1),
  VITE_AUTH0_CLIENT_ID: z.string().min(1),
  VITE_AUTH0_AUDIENCE: z.url().optional(),
  VITE_API_URL: z.string().optional(),
  VITE_ASSISTANT_ID: z.string().optional(),
  VITE_SENTRY_DSN: z.url().optional(),
  VITE_APP_BASE_URL: z.url(),
  VITE_APP_VERSION: z.string().optional(),
});

const skipValidation = import.meta.env.VITE_SKIP_ENV_VALIDATION === "true";

const clientEnv = skipValidation
  ? (import.meta.env as any)
  : clientSchema.parse({
      VITE_AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN,
      VITE_AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID,
      VITE_AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE,
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_ASSISTANT_ID: import.meta.env.VITE_ASSISTANT_ID,
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
      VITE_APP_BASE_URL: import.meta.env.VITE_APP_BASE_URL,
      VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
    });

export const env = createEnv();
```

**Why:** Validation catches misconfiguration at startup instead of runtime.

### Validation Benefits

```typescript
// Without validation
const apiUrl = process.env.VITE_API_URL;
// Type: string | undefined
// Runtime error if undefined

// With validation
const apiUrl = env.API_URL;
// Type: string
// Fails at startup if missing
```

### Skipping Validation

For CI/CD where variables are set at runtime:

```bash
VITE_SKIP_ENV_VALIDATION=true pnpm build
```

**Why:** Some platforms inject variables after build time.

## .env.local vs Platform Environment Variables

### .env.local (Development)

**Use for:**
- Local development
- Personal testing
- Quick prototyping

**Characteristics:**
- Not committed to Git
- Lives in project directory
- Easy to edit
- Loaded by Vite automatically

### Platform Environment Variables (Production)

**Use for:**
- Production deployments
- Staging environments
- CI/CD pipelines

**Platforms:**
- **Vercel:** Project Settings → Environment Variables
- **Netlify:** Site Settings → Environment Variables
- **GitHub Actions:** Repository Settings → Secrets

**Characteristics:**
- Managed in platform UI
- Encrypted at rest
- Different values per environment
- No file needed

### Example: Vercel Configuration

```bash
# Vercel Dashboard → Project → Settings → Environment Variables

# Production
VITE_AUTH0_DOMAIN=prod.auth0.com
VITE_API_URL=https://api.production.com

# Preview (branches)
VITE_AUTH0_DOMAIN=staging.auth0.com
VITE_API_URL=https://api.staging.com

# Development (local)
VITE_AUTH0_DOMAIN=dev.auth0.com
VITE_API_URL=http://localhost:2024
```

**Why:** Platform variables are more secure and environment-specific.

## Never Commit Secrets

### Common Mistakes

```bash
# ❌ NEVER DO THIS
git add .env.local
git commit -m "Add environment variables"
git push

# ❌ NEVER DO THIS
git add .env.production
git commit -m "Add production config"

# ❌ NEVER DO THIS - hardcoding secrets
const apiKey = "sk_live_secret_key_12345";
```

### If You Accidentally Commit a Secret

1. **Immediately rotate the secret** (generate new one)
2. **Remove from Git history** (not just delete file)
3. **Update all environments** with new secret

```bash
# Remove from Git history (use with caution)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Or use BFG Repo-Cleaner (recommended)
bfg --delete-files .env.local

# Force push (WARNING: rewrites history)
git push origin --force --all
```

**Why:** Git history is permanent; committed secrets must be rotated.

## Security Best Practices

### 1. Use Different Secrets Per Environment

```bash
# Development Auth0
VITE_AUTH0_DOMAIN=dev.auth0.com
VITE_AUTH0_CLIENT_ID=dev_client_id

# Production Auth0
VITE_AUTH0_DOMAIN=prod.auth0.com
VITE_AUTH0_CLIENT_ID=prod_client_id
```

**Why:** If dev credentials leak, production stays secure.

### 2. Rotate Secrets Regularly

- **Monthly:** API keys
- **Quarterly:** OAuth credentials
- **Immediately:** If compromised

### 3. Use Least Privilege

```bash
# ❌ Admin API key
LANGSMITH_API_KEY=lsv2_admin_full_access

# ✅ Read-only API key
LANGSMITH_API_KEY=lsv2_readonly_limited
```

**Why:** Limits damage if credentials are compromised.

### 4. Validate Variable Formats

```typescript
// Validate URL format
VITE_APP_BASE_URL: z.url()

// Validate string presence
VITE_AUTH0_DOMAIN: z.string().min(1)

// Validate enum values
NODE_ENV: z.enum(['development', 'production', 'test'])
```

**Why:** Prevents misconfiguration errors.

### 5. Document All Variables

In `/home/user/tiler2-ui/.env.example`:

```bash
# [REQUIRED] Auth0 Domain (Client-side)
# Your Auth0 tenant domain
# Format: your-tenant.auth0.com
# Find it in: Auth0 Dashboard → Applications → Settings
VITE_AUTH0_DOMAIN='your-domain.auth0.com'
```

**Why:** Documentation helps other developers and your future self.

## Rotation Procedures

### When to Rotate

- **Scheduled:** Monthly/quarterly rotation
- **Developer leaves:** When team member departs
- **Suspected compromise:** Any suspicious activity
- **Platform breach:** When third-party has breach

### How to Rotate

#### Auth0 Credentials

1. Create new Auth0 application
2. Update environment variables
3. Deploy new version
4. Monitor for errors
5. Delete old application

#### API Keys

1. Generate new key in provider dashboard
2. Update environment variables
3. Test in staging
4. Deploy to production
5. Revoke old key after verification

#### Example Rotation Script

```bash
#!/bin/bash
# rotate-secrets.sh

echo "Rotating Auth0 credentials..."

# 1. Generate new credentials (manual in Auth0 dashboard)
echo "Please create new Auth0 application and enter credentials:"
read -p "New CLIENT_ID: " NEW_CLIENT_ID
read -p "New DOMAIN: " NEW_DOMAIN

# 2. Update .env.local
cat > .env.local << EOF
VITE_AUTH0_DOMAIN=${NEW_DOMAIN}
VITE_AUTH0_CLIENT_ID=${NEW_CLIENT_ID}
# ... other variables
EOF

# 3. Test locally
pnpm dev

# 4. If successful, update platform variables
echo "Update platform variables manually, then press enter"
read

# 5. Deploy
pnpm build
echo "Deploy to production, then press enter"
read

# 6. Revoke old credentials
echo "Revoke old Auth0 application in dashboard"
```

## Environment-Specific Configuration

### Development

```bash
# .env.development
VITE_API_URL=http://localhost:2024
VITE_APP_BASE_URL=http://localhost:3000
VITE_SENTRY_DSN=  # Sentry disabled in dev
```

### Staging

```bash
# Vercel/Netlify → Staging Environment
VITE_API_URL=https://api.staging.example.com
VITE_APP_BASE_URL=https://staging.example.com
VITE_SENTRY_DSN=https://staging@sentry.io/123
```

### Production

```bash
# Vercel/Netlify → Production Environment
VITE_API_URL=https://api.example.com
VITE_APP_BASE_URL=https://example.com
VITE_SENTRY_DSN=https://production@sentry.io/456
```

## Accessing Environment Variables

### In Code

```typescript
// ✅ Using validated env object (recommended)
import { env } from "@/env";

const apiUrl = env.API_URL;
const authDomain = env.AUTH0_DOMAIN;

// ✅ Direct access (not type-safe)
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ Wrong - no VITE_ prefix won't work
const secret = import.meta.env.SECRET_KEY; // undefined
```

### In Config Files

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:8000",
      },
    },
  },
});
```

## Troubleshooting

### Issue: Variable is Undefined

**Cause:** Missing VITE_ prefix or variable not set

**Solution:**
```bash
# Check if variable is set
echo $VITE_API_URL

# Restart dev server after adding variable
pnpm dev
```

### Issue: Changes Not Reflected

**Cause:** Vite caches environment variables

**Solution:**
```bash
# Restart dev server
# Vite only loads .env files on startup
```

### Issue: Validation Fails in CI

**Cause:** Variables not set in CI environment

**Solution:**
```yaml
# .github/workflows/deploy.yml
env:
  VITE_AUTH0_DOMAIN: ${{ secrets.AUTH0_DOMAIN }}
  VITE_AUTH0_CLIENT_ID: ${{ secrets.AUTH0_CLIENT_ID }}
```

## Related Documentation

- See [41-security.md](/home/user/tiler2-ui/docs/41-security.md) for security practices
- See [02-configuration.md](/home/user/tiler2-ui/docs/02-configuration.md) for setup
- See [25-deployment.md](/home/user/tiler2-ui/docs/25-deployment.md) for deployment
- See full `.env.example` at `/home/user/tiler2-ui/.env.example`

---

**Next:** [43-common-issues.md](/home/user/tiler2-ui/docs/43-common-issues.md)
