# Deployment

## Overview

This application is deployed as a static site on Vercel with automatic deployments from GitHub. This guide covers deployment configuration, environment setup, CI/CD pipeline, and alternative hosting options.

**Deployment Stack:**
- **Hosting**: Vercel (primary)
- **CI/CD**: GitHub Actions for code quality
- **Domain**: Custom domain with automatic HTTPS
- **CDN**: Vercel Edge Network (global)
- **Previews**: Automatic preview deployments for PRs

**Production URL:** Configured in `VITE_APP_BASE_URL` environment variable

---

## Vercel Deployment Setup

### Initial Setup

1. **Connect Repository to Vercel:**
   ```bash
   # Install Vercel CLI (optional)
   npm i -g vercel

   # Link project to Vercel
   vercel link
   ```

2. **Configure Build Settings:**
   - Framework Preset: **Vite**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

3. **Set Environment Variables:**
   - Go to **Project Settings → Environment Variables**
   - Add all `VITE_` prefixed variables from `.env.example`
   - Configure for Production, Preview, and Development environments

### Vercel Configuration File

Configuration is defined in `/home/user/tiler2-ui/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
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

**Configuration Breakdown:**

1. **Rewrites:**
   - Routes all requests to `index.html`
   - Enables client-side routing (React Router)
   - Prevents 404 errors on page refreshes

2. **Security Headers:**
   - `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
   - `X-Frame-Options: DENY` - Prevents clickjacking attacks
   - `X-XSS-Protection: 1; mode=block` - Enables XSS protection

3. **Cache Headers:**
   - Assets cached for 1 year (`max-age=31536000`)
   - `immutable` flag indicates content never changes (hash-based names)
   - Optimizes performance and reduces bandwidth

---

## Environment Variables in Production

### Required Variables

```bash
# Authentication (Required)
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_APP_BASE_URL=https://your-app.vercel.app

# LangGraph API (Optional - can be configured at runtime)
VITE_API_URL=https://your-agent.default.us.langgraph.app
VITE_ASSISTANT_ID=agent

# Monitoring (Optional)
VITE_SENTRY_DSN=https://key@o0.ingest.sentry.io/project-id
```

### Build-Time Variables

```bash
# Sentry Source Map Upload (Build-time only)
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=sntrys_your-token-here
```

### Setting Variables in Vercel

**Via Dashboard:**
1. Go to **Project Settings → Environment Variables**
2. Click **Add New**
3. Enter key and value
4. Select environments: Production, Preview, Development
5. Click **Save**

**Via Vercel CLI:**
```bash
# Production
vercel env add VITE_AUTH0_DOMAIN production

# Preview (PR deployments)
vercel env add VITE_AUTH0_DOMAIN preview

# Development (vercel dev)
vercel env add VITE_AUTH0_DOMAIN development
```

**Environment Types:**

- **Production**: Used for production deployments from main branch
- **Preview**: Used for PR preview deployments
- **Development**: Used for local `vercel dev` command

### Variable Validation

Environment variables are validated at build time using Zod:

```typescript
// src/env.ts
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
```

**Build will fail if:**
- Required variables are missing
- Variables have invalid format (e.g., invalid URL)
- Type validation fails

**Skip validation (not recommended):**
```bash
VITE_SKIP_ENV_VALIDATION=true pnpm build
```

---

## GitHub Actions CI/CD Pipeline

### Workflow Configuration

GitHub Actions runs automated checks on all PRs and pushes to main. Configuration is in `/home/user/tiler2-ui/.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: ["main"]
  pull_request:
  workflow_dispatch:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  format:
    name: Check formatting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.5.1
      - uses: actions/setup-node@v4
        with:
          node-version: "18.x"
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install
      - name: Check formatting
        run: pnpm format:check

  lint:
    name: Check linting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10.5.1
      - uses: actions/setup-node@v4
        with:
          node-version: "18.x"
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install
      - name: Check linting
        run: pnpm lint

  readme-spelling:
    name: Check README spelling
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: codespell-project/actions-codespell@v2
        with:
          ignore_words_file: .codespellignore
          path: README.md

  check-spelling:
    name: Check code spelling
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: codespell-project/actions-codespell@v2
        with:
          ignore_words_file: .codespellignore
          path: src
```

### Workflow Breakdown

**Triggers:**
- `push` to `main` branch
- Any `pull_request` opened or updated
- `workflow_dispatch` for manual runs

**Concurrency:**
- Cancels previous runs when new commits pushed
- Saves CI minutes and speeds up feedback
- Uses unique group per workflow and ref

**Jobs:**

1. **Format Check** (`pnpm format:check`)
   - Validates Prettier formatting
   - Ensures consistent code style
   - Uses `.prettierrc.json` configuration

2. **Lint Check** (`pnpm lint`)
   - Runs ESLint on TypeScript/React code
   - Catches code quality issues
   - Uses `eslint.config.js` configuration

3. **README Spelling** (`codespell`)
   - Checks README.md for spelling errors
   - Uses `.codespellignore` for exceptions

4. **Code Spelling** (`codespell`)
   - Checks source code for spelling errors
   - Prevents typos in comments and strings

### CI Best Practices

**Fail Fast:**
- All jobs run in parallel
- Any failure prevents merge
- Fast feedback to developers

**Caching:**
- pnpm dependencies cached
- Speeds up subsequent runs
- Reduces CI time

**Consistency:**
- Same checks run locally and in CI
- Pre-commit hooks prevent CI failures
- Lock file ensures reproducible builds

---

## Preview Deployments for PRs

### Automatic Preview Deployments

Vercel automatically creates preview deployments for every pull request:

**Workflow:**
1. Developer opens PR
2. Vercel detects new commit
3. Builds and deploys to unique URL
4. Comments on PR with preview URL
5. Updates deployment on new commits

**Preview URL Format:**
```
https://[project]-[git-branch]-[vercel-user].vercel.app
```

### Preview Environment Variables

Configure separate values for previews:

```bash
# Preview might use test Auth0 tenant
VITE_AUTH0_DOMAIN=test-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=test-client-id

# Preview might point to staging API
VITE_API_URL=https://staging-agent.langgraph.app
```

### Testing Preview Deployments

**Manual Testing:**
1. Click preview URL in PR comment
2. Test features in isolation
3. Verify Auth0 login works
4. Check API integrations
5. Validate UI changes

**Automated Checks:**
- GitHub Actions runs on preview code
- Vercel runs build checks
- Can add E2E tests with Playwright/Cypress

### Preview Deployment Limits

**Vercel Free Tier:**
- Unlimited preview deployments
- 100 GB bandwidth per month
- 100 build executions per day
- 6000 build minutes per month

**Vercel Pro Tier:**
- Unlimited everything (within reason)
- Custom deployment protections
- Password protection for previews
- Deployment comments on PRs

---

## Production Deployment Process

### Deployment Workflow

**Automatic Deployment (Recommended):**

1. **Merge PR to Main:**
   ```bash
   # Via GitHub UI or CLI
   gh pr merge 123 --squash
   ```

2. **Vercel Detects Push:**
   - Triggers production build
   - Runs build command: `pnpm build`
   - Uploads source maps to Sentry

3. **Build Process:**
   - Install dependencies: `pnpm install`
   - Type check: `tsc`
   - Bundle: `vite build`
   - Upload to Sentry: `sentryVitePlugin`

4. **Deploy to Production:**
   - Uploads `dist/` to Vercel CDN
   - Updates DNS to point to new deployment
   - Creates immutable deployment URL
   - Assigns to production domain

5. **Verification:**
   - Visit production URL
   - Check Sentry for errors
   - Verify deployment in Vercel dashboard

**Manual Deployment (via CLI):**

```bash
# Deploy to production
vercel --prod

# Or deploy specific directory
vercel --prod dist/
```

### Deployment States

**Building:**
- Code is being compiled
- Dependencies being installed
- Assets being optimized

**Deploying:**
- Uploading to Vercel Edge Network
- Propagating to global CDN
- Updating DNS records

**Ready:**
- Deployment live
- Accessible via production URL
- Previous deployment still accessible via unique URL

**Error:**
- Build failed or deployment failed
- Check logs in Vercel dashboard
- Fix issues and redeploy

### Deployment Notifications

**GitHub Integration:**
- Deployment status in PR checks
- Comments on commits with deployment URL
- Status badges available

**Slack Integration (Optional):**
```bash
# Configure in Vercel dashboard
Settings → Integrations → Slack
```

**Email Notifications:**
- Failed deployments alert via email
- Configurable in Vercel account settings

---

## Custom Domain Setup

### Adding Custom Domain

**Via Vercel Dashboard:**

1. Go to **Project Settings → Domains**
2. Click **Add Domain**
3. Enter domain name (e.g., `app.example.com`)
4. Configure DNS:

**DNS Configuration (Cloudflare, Namecheap, etc.):**

**Option 1: CNAME Record (Subdomains):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: Auto
```

**Option 2: A Record (Apex Domain):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

**Verification:**
```bash
# Check DNS propagation
dig app.example.com

# Check HTTPS certificate
curl -I https://app.example.com
```

### SSL/TLS Certificates

**Automatic HTTPS:**
- Vercel provides free SSL certificates
- Auto-renews via Let's Encrypt
- Supports wildcard certificates
- Forces HTTPS redirects

**Custom Certificates (Enterprise):**
- Upload custom SSL certificate
- Configure in Vercel dashboard
- Support for extended validation (EV) certs

### Domain Configuration

**Multiple Domains:**
```bash
# Production domain
app.example.com

# Staging domain (different Vercel project)
staging.example.com

# Redirect old domain
old-app.example.com → app.example.com
```

**Redirects:**
```json
// vercel.json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

---

## CDN and Caching Configuration

### Vercel Edge Network

**Global CDN:**
- 100+ edge locations worldwide
- Automatic geographic routing
- Sub-50ms latency globally
- DDoS protection included

**Edge Caching:**
- Static assets cached at edge
- Dynamic routes cached when possible
- Cache invalidation on new deployments

### Cache Control Headers

From `/home/user/tiler2-ui/vercel.json`:

```json
{
  "headers": [
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

**Cache Strategy:**

1. **Static Assets** (`/assets/*`):
   - Cached for 1 year
   - Immutable (never changes)
   - Safe due to hash-based filenames

2. **HTML Files** (`index.html`):
   - Not cached (always fresh)
   - Small file, fast to fetch
   - Ensures users get latest assets

3. **API Requests**:
   - Not cached (handled by LangGraph backend)
   - Auth tokens refreshed as needed

### Cache Invalidation

**Automatic:**
- New deployment invalidates entire cache
- Hash changes in filenames force refetch
- No manual cache clearing needed

**Manual (if needed):**
```bash
# Purge all cache (Vercel Pro)
vercel env pull
vercel cache clear
```

### Performance Optimization

**Brotli Compression:**
- Automatically enabled by Vercel
- 10-20% better than gzip
- Supported by all modern browsers

**Image Optimization:**
- Use Vercel Image Optimization API (optional)
- Automatic WebP conversion
- Responsive image sizing

```typescript
// If using Vercel Image Optimization
import Image from 'next/image' // Note: This is for Next.js
// For Vite, use vite-imagetools or manual optimization
```

---

## Deployment Best Practices

### Pre-Deployment Checklist

- [ ] Run tests locally: `pnpm test` (if configured)
- [ ] Type check: `pnpm check`
- [ ] Lint: `pnpm lint`
- [ ] Format: `pnpm format:check`
- [ ] Build locally: `pnpm build`
- [ ] Preview build: `pnpm preview`
- [ ] Test authentication flow
- [ ] Verify environment variables in Vercel
- [ ] Check Sentry configuration

### Environment-Specific Configurations

**Development:**
```bash
VITE_API_URL=http://localhost:2024
VITE_AUTH0_DOMAIN=dev-tenant.auth0.com
VITE_SENTRY_DSN=  # Disable Sentry in dev
```

**Staging/Preview:**
```bash
VITE_API_URL=https://staging-agent.langgraph.app
VITE_AUTH0_DOMAIN=staging-tenant.auth0.com
VITE_SENTRY_DSN=https://staging@sentry.io/...
SENTRY_ENVIRONMENT=staging
```

**Production:**
```bash
VITE_API_URL=https://prod-agent.langgraph.app
VITE_AUTH0_DOMAIN=prod-tenant.auth0.com
VITE_SENTRY_DSN=https://prod@sentry.io/...
SENTRY_ENVIRONMENT=production
```

### Security Best Practices

1. **Secrets Management:**
   - Never commit `.env` files
   - Use Vercel environment variables
   - Rotate Auth0 credentials regularly
   - Separate dev/staging/prod credentials

2. **Auth0 Configuration:**
   - Whitelist only production URLs in callback URLs
   - Use different Auth0 applications per environment
   - Enable MFA for admin accounts

3. **Content Security Policy:**
   ```json
   // vercel.json - Add CSP headers
   {
     "headers": [{
       "key": "Content-Security-Policy",
       "value": "default-src 'self'; script-src 'self' 'unsafe-inline'"
     }]
   }
   ```

4. **Dependency Audits:**
   ```bash
   # Regular security audits
   pnpm audit
   pnpm audit --fix
   ```

### Monitoring Deployments

**Vercel Dashboard:**
- Deployment logs
- Build duration
- Bundle size tracking
- Error rates

**Sentry:**
- Error tracking post-deployment
- Performance monitoring
- Release tracking

**Custom Monitoring:**
```typescript
// Track deployment version
console.log('App Version:', env.APP_VERSION);
console.log('Environment:', import.meta.env.MODE);
```

---

## Rollback Procedures

### Instant Rollback

Vercel maintains all previous deployments:

**Via Dashboard:**
1. Go to **Deployments** tab
2. Find previous working deployment
3. Click **⋯** menu
4. Select **Promote to Production**
5. Deployment instantly becomes live

**Via CLI:**
```bash
# List recent deployments
vercel ls

# Promote specific deployment
vercel promote [deployment-url]
```

**Rollback Time:**
- Instant (< 30 seconds)
- No rebuild required
- Previous deployment already on CDN

### Git Rollback

For more complex issues:

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard abc123
git push --force origin main  # Be careful!
```

### Rollback Best Practices

1. **Test Before Promoting:**
   - Verify rollback deployment works
   - Check preview URL
   - Confirm no breaking changes

2. **Communicate:**
   - Notify team of rollback
   - Document reason in Slack/Discord
   - Create incident report

3. **Root Cause Analysis:**
   - Investigate what went wrong
   - Fix underlying issue
   - Add tests to prevent regression

4. **Gradual Rollout (Advanced):**
   - Use feature flags for gradual rollout
   - Deploy to subset of users first
   - Monitor before full deployment

---

## Alternative Deployment Platforms

### Netlify

**Setup:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

**Configuration (`netlify.toml`):**
```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

**Pros:**
- Similar to Vercel
- Great DX
- Built-in forms and serverless functions

**Cons:**
- Slightly slower build times
- Less sophisticated edge network

### Cloudflare Pages

**Setup:**
```bash
# Deploy via CLI
npx wrangler pages deploy dist

# Or connect GitHub repository
# Via Cloudflare Dashboard → Pages → Create Project
```

**Configuration:**
- Build command: `pnpm build`
- Build output: `dist`
- Framework preset: Vite

**Pros:**
- Fastest global CDN
- Unlimited bandwidth (free tier)
- Workers for edge compute

**Cons:**
- Different workflow than Vercel
- Less integrated developer experience

### GitHub Pages

**Setup:**
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
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

**Configuration (`vite.config.ts`):**
```typescript
export default defineConfig({
  base: '/repository-name/', // For project pages
  // Or base: '/' for user/org pages
});
```

**Pros:**
- Free for public repos
- Simple setup
- Integrated with GitHub

**Cons:**
- No preview deployments
- No environment variables
- Limited custom domain support

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

**Deployment:**
```bash
# Build image
docker build -t tiler2-ui .

# Run locally
docker run -p 8080:80 tiler2-ui

# Deploy to cloud (AWS, GCP, Azure)
# Push to container registry and deploy
```

---

## Related Documentation

**Next:** [Monitoring →](./26-monitoring.md)

**See Also:**
- [Build Process](./24-build-process.md) - Build configuration
- [Configuration](./02-configuration.md) - Environment variables
- [Development Workflow](./03-development-workflow.md) - Local development
- [Error Handling](./17-error-handling.md) - Production error handling
