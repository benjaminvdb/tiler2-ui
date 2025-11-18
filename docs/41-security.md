# Security

This document outlines security measures, best practices, and considerations for maintaining a secure application.

## Overview

Security is implemented through multiple layers:
- **Security headers** - HTTP headers for browser protection
- **Authentication** - Auth0 OAuth2/OIDC implementation
- **Input validation** - Client and server-side validation
- **XSS protection** - Content sanitization
- **CSRF protection** - Token-based protection
- **Dependency security** - Regular updates and audits

## Security Headers

### Configuration: `/home/user/tiler2-ui/vercel.json`

```json
{
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
    }
  ]
}
```

### Headers Explained

#### X-Content-Type-Options: nosniff

Prevents MIME type sniffing, forcing browsers to respect declared content types.

```http
X-Content-Type-Options: nosniff
```

**Attack prevented:**
- User uploads `malicious.jpg` (actually JavaScript)
- Without header: Browser might execute as script
- With header: Browser treats as image only

**Why:** Prevents execution of disguised malicious content.

#### X-Frame-Options: DENY

Prevents the page from being embedded in iframes.

```http
X-Frame-Options: DENY
```

**Attack prevented:**
- Clickjacking - attacker embeds your page in invisible iframe
- User thinks they're clicking attacker's page
- Actually clicking your page buttons

**Why:** Prevents clickjacking attacks.

#### X-XSS-Protection: 1; mode=block

Enables browser's XSS filter to block suspicious scripts.

```http
X-XSS-Protection: 1; mode=block
```

**Why:** Legacy protection for older browsers (modern browsers use CSP).

### Recommended Additional Headers

#### Content-Security-Policy (CSP)

**Not currently implemented.** Recommended for enhanced security:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.auth0.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.auth0.com https://*.langgraph.app;
```

**Why:** CSP restricts resource loading, preventing XSS and data injection.

#### Strict-Transport-Security (HSTS)

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Why:** Forces HTTPS connections, preventing man-in-the-middle attacks.

## Authentication Security

### Auth0 Implementation

Authentication uses Auth0 with OAuth2/PKCE flow.

#### PKCE (Proof Key for Code Exchange)

```typescript
// Auth0 configuration in Auth0Provider
<Auth0Provider
  domain={env.AUTH0_DOMAIN}
  clientId={env.AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: env.APP_BASE_URL,
    audience: env.AUTH0_AUDIENCE,
  }}
  useRefreshTokens={true}
  cacheLocation="localstorage"
>
```

**PKCE flow:**
1. Generate random `code_verifier`
2. Create `code_challenge` from verifier
3. Send challenge to Auth0
4. Auth0 returns authorization code
5. Exchange code + verifier for tokens
6. Tokens stored securely

**Why PKCE:** Prevents authorization code interception attacks in SPAs.

### Token Storage

**Tokens are stored in localStorage** (configured via `cacheLocation`):
- Refresh tokens for long-lived sessions
- Access tokens for API calls
- ID tokens for user identity

**Security considerations:**
- ✅ Tokens are HTTP-only when possible
- ✅ Tokens expire and refresh automatically
- ⚠️ localStorage accessible to JavaScript (XSS risk)
- ✅ Mitigated by input sanitization and CSP

**Alternative:** Consider `memory` storage for maximum security (requires re-auth on page refresh).

### Session Management

```typescript
// Automatic token refresh
useRefreshTokens={true}

// Token expiration handling
const { isAuthenticated, loginWithRedirect } = useAuth0();

if (!isAuthenticated) {
  loginWithRedirect();
}
```

**Why:** Automatic refresh maintains sessions without user intervention.

### Logout Security

```typescript
// Proper logout
const { logout } = useAuth0();

logout({
  logoutParams: {
    returnTo: window.location.origin
  }
});
```

**Why:** Clears tokens and sessions completely, preventing session hijacking.

## Input Validation

### Client-Side Validation

#### Message Content

```typescript
// Validate before sending
function validateMessage(content: string): boolean {
  if (content.trim().length === 0) {
    return false; // Empty message
  }

  if (content.length > 10000) {
    return false; // Too long
  }

  return true;
}
```

**Why:** Prevents sending invalid data to backend.

#### File Upload Validation

```typescript
// Validate file type and size
function validateFile(file: File): boolean {
  const allowedTypes = ["image/png", "image/jpeg", "image/gif", "application/pdf"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type");
  }

  if (file.size > maxSize) {
    throw new Error("File too large");
  }

  return true;
}
```

**Why:** Prevents uploading malicious or oversized files.

### Environment Variable Validation

From `/home/user/tiler2-ui/src/env.ts`:

```typescript
const clientSchema = z.object({
  VITE_AUTH0_DOMAIN: z.string().min(1),
  VITE_AUTH0_CLIENT_ID: z.string().min(1),
  VITE_AUTH0_AUDIENCE: z.url().optional(),
  VITE_API_URL: z.string().optional(),
  VITE_ASSISTANT_ID: z.string().optional(),
  VITE_SENTRY_DSN: z.url().optional(),
  VITE_APP_BASE_URL: z.url(),
});
```

**Why:** Runtime validation prevents misconfiguration and injection attacks.

## XSS Protection

### Content Sanitization

#### Markdown Rendering

```typescript
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

<ReactMarkdown rehypePlugins={[rehypeSanitize]}>
  {message.content}
</ReactMarkdown>
```

**Why:** `rehype-sanitize` removes dangerous HTML/JavaScript from markdown.

#### What Gets Sanitized

```typescript
// User input (potentially malicious)
const malicious = `
  <img src=x onerror="alert('XSS')">
  <script>alert('XSS')</script>
  <a href="javascript:alert('XSS')">Click</a>
`;

// After sanitization
const safe = `
  <img src=x>

  <a href="">Click</a>
`;
```

**Why:** Prevents execution of attacker-controlled scripts.

### Dangerous Patterns to Avoid

```typescript
// ❌ NEVER DO THIS - Unsafe
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ NEVER DO THIS - eval is evil
eval(userInput);

// ❌ NEVER DO THIS - Direct script injection
<script>{userInput}</script>

// ✅ DO THIS - Safe rendering
<ReactMarkdown rehypePlugins={[rehypeSanitize]}>
  {userInput}
</ReactMarkdown>
```

**Why:** `dangerouslySetInnerHTML` and `eval` bypass React's XSS protection.

## CSRF Protection

### Auth0 State Parameter

Auth0 automatically includes CSRF protection via `state` parameter:

```typescript
// Auth0 generates random state
state = "abc123xyz789"

// User clicks login
redirect to auth0.com/authorize?state=abc123xyz789

// Auth0 redirects back
redirect to app.com/callback?state=abc123xyz789

// Verify state matches
if (receivedState !== expectedState) {
  throw new Error("CSRF attack detected");
}
```

**Why:** State parameter prevents CSRF attacks on authentication flow.

### SameSite Cookies

When using cookies (not applicable for localStorage tokens):

```http
Set-Cookie: session=xyz; SameSite=Strict; Secure; HttpOnly
```

**Why:** SameSite prevents cross-site request forgery.

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
pnpm audit

# Fix automatically when possible
pnpm audit fix

# Update dependencies
pnpm update
```

### Dependency Review

From `/home/user/tiler2-ui/package.json`:

**Security-relevant dependencies:**
- `@auth0/auth0-react` - Authentication (keep updated)
- `zod` - Runtime validation (keep updated)
- `rehype-sanitize` - Content sanitization (critical)
- `react` - Core framework (monitor security releases)

**Why:** Outdated dependencies may contain known vulnerabilities.

### Automated Dependency Updates

**Recommended:** Use Dependabot or Renovate:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

**Why:** Automated updates ensure timely security patches.

## Security Best Practices

### 1. Never Commit Secrets

```bash
# ❌ NEVER commit these files
.env.local
.env.production.local
credentials.json
private-key.pem

# ✅ These files are in .gitignore
```

**Why:** Committed secrets can be exploited by attackers.

### 2. Use Environment Variables

```typescript
// ❌ NEVER hardcode secrets
const apiKey = "sk_live_abc123";

// ✅ Use environment variables
const apiKey = import.meta.env.VITE_API_KEY;
```

**Why:** Environment variables keep secrets out of source code.

### 3. Validate All Inputs

```typescript
// ✅ Always validate user input
function processInput(input: string) {
  if (typeof input !== "string") {
    throw new Error("Invalid input type");
  }

  if (input.length > MAX_LENGTH) {
    throw new Error("Input too long");
  }

  // Process validated input
}
```

**Why:** Validation prevents injection attacks and unexpected behavior.

### 4. Sanitize Output

```typescript
// ✅ Always sanitize before rendering
<ReactMarkdown rehypePlugins={[rehypeSanitize]}>
  {userContent}
</ReactMarkdown>
```

**Why:** Sanitization prevents XSS attacks.

### 5. Use HTTPS Everywhere

```typescript
// ✅ Force HTTPS in production
if (import.meta.env.PROD && window.location.protocol !== "https:") {
  window.location.protocol = "https:";
}
```

**Why:** HTTPS encrypts data in transit, preventing eavesdropping.

### 6. Implement Rate Limiting

**Backend responsibility**, but monitor:
- Login attempts
- API calls
- File uploads

**Why:** Rate limiting prevents brute force and DoS attacks.

### 7. Log Security Events

```typescript
// Log authentication events
console.log("User logged in:", { userId, timestamp });

// Log authorization failures
console.warn("Unauthorized access attempt:", { userId, resource });

// Log suspicious activity
console.error("Potential attack detected:", { type, details });
```

**Why:** Logs enable security monitoring and incident response.

## OWASP Top 10 Considerations

### A01:2021 - Broken Access Control

**Mitigation:**
- Auth0 handles authentication
- Backend validates all requests
- No client-side authorization logic

### A02:2021 - Cryptographic Failures

**Mitigation:**
- HTTPS for all connections
- Auth0 handles token encryption
- No sensitive data in localStorage (except tokens)

### A03:2021 - Injection

**Mitigation:**
- Input validation with Zod
- Output sanitization with rehype-sanitize
- No dynamic SQL or eval

### A04:2021 - Insecure Design

**Mitigation:**
- Security headers configured
- PKCE flow for OAuth2
- Regular security reviews

### A05:2021 - Security Misconfiguration

**Mitigation:**
- Environment variable validation
- TypeScript strict mode
- Production source maps removed after upload

### A06:2021 - Vulnerable Components

**Mitigation:**
- Regular dependency updates
- `pnpm audit` in CI/CD
- Monitoring security advisories

### A07:2021 - Identification and Authentication Failures

**Mitigation:**
- Auth0 industry-standard auth
- PKCE prevents code interception
- Automatic token refresh

### A08:2021 - Software and Data Integrity Failures

**Mitigation:**
- Dependency integrity via lock files
- CSP (recommended)
- Subresource Integrity (SRI) for CDN

### A09:2021 - Security Logging and Monitoring Failures

**Mitigation:**
- Sentry error tracking
- Authentication event logging
- Production monitoring

### A10:2021 - Server-Side Request Forgery (SSRF)

**Mitigation:**
- No server-side requests from user input
- URL validation when needed
- Backend handles external requests

## Incident Response

### If Security Issue Found

1. **Do not disclose publicly** - Report privately first
2. **Contact maintainers** - Via GitHub security advisory
3. **Provide details** - Steps to reproduce, impact assessment
4. **Wait for fix** - Allow time for patch before disclosure

### Reporting Security Vulnerabilities

**Email:** [Security contact from repository]

**Include:**
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Checklist

### Development

- [ ] Never commit secrets
- [ ] Validate all user inputs
- [ ] Sanitize all outputs
- [ ] Use TypeScript strict mode
- [ ] Run security audits regularly

### Deployment

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Environment variables set correctly
- [ ] Dependencies updated
- [ ] Error tracking configured

### Monitoring

- [ ] Log authentication events
- [ ] Monitor failed login attempts
- [ ] Track suspicious activity
- [ ] Review security logs regularly
- [ ] Update dependencies monthly

## Related Documentation

- See [42-environment-variables.md](/home/user/tiler2-ui/docs/42-environment-variables.md) for secrets management
- See [16-authentication.md](/home/user/tiler2-ui/docs/16-authentication.md) for Auth0 details
- See [46-dependencies.md](/home/user/tiler2-ui/docs/46-dependencies.md) for dependency management
- See [26-monitoring.md](/home/user/tiler2-ui/docs/26-monitoring.md) for security monitoring

---

**Next:** [42-environment-variables.md](/home/user/tiler2-ui/docs/42-environment-variables.md)
