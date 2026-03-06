# Link Frontend Security Best Practices Audit

Date: March 6, 2026
Scope: `/home/benny/link-chat/link-chat-frontend`
Stack reviewed: TypeScript, React 19, Vite, Auth0, SWR, Vercel deploy config

## Executive Summary

The frontend is generally structured and avoids major DOM XSS sinks (`dangerouslySetInnerHTML`, `eval`, `document.write`), and dependency audit returned no known high-severity advisories at review time (`pnpm audit --prod --audit-level=high`).

However, 5 security best-practice gaps were identified:

1. High: Auth0 tokens are persisted in `localStorage` with refresh tokens enabled.
2. Medium: Authenticated API data is persisted to `localStorage` via SWR global cache.
3. Medium: Unvalidated externally controlled URLs are rendered/opened directly.
4. Medium: CSP is not visible in deployable repo config (defense-in-depth gap).
5. Low: CI uses non-frozen installs (`pnpm install`), allowing dependency drift.

## Remediation Status

As of March 6, 2026, all findings `F-001` through `F-005` have been remediated in the codebase.

## High Severity

### [F-001] Auth Tokens Persisted in `localStorage` (Refresh Tokens Enabled)

- Rule IDs: `REACT-TOKEN-001`, `JS-STORAGE-001`
- Severity: High
- Location:
  - `src/main.tsx:43`
  - `src/main.tsx:44`
- Evidence:
  ```tsx
  useRefreshTokens={true}
  cacheLocation="localstorage"
  ```
- Impact:
  - Any successful XSS can exfiltrate access/refresh tokens from browser storage.
  - Refresh token theft materially increases session hijack/account takeover risk.
- Fix:
  - Prefer `cacheLocation="memory"` and avoid persistent browser storage for tokens.
  - If persistence is operationally required, move auth/session handling to a BFF with `HttpOnly` session cookies and CSRF protections.
  - Reassess Auth0 refresh token rotation + token lifetime policies.
- Mitigation (if immediate fix is hard):
  - Add strict CSP and Trusted Types rollout to lower XSS probability.
  - Shorten token lifetimes and ensure refresh token rotation/revocation monitoring.
- False positive notes:
  - This finding assumes standard browser XSS threat model; risk remains high for any public web app.

## Medium Severity

### [F-002] SWR Cache Persists Authenticated API Responses in `localStorage`

- Rule IDs: `JS-STORAGE-001`
- Severity: Medium
- Location:
  - `src/App.tsx:108`
  - `src/core/providers/swr-cache-provider.ts:11`
  - `src/core/providers/swr-cache-provider.ts:18`
  - `src/features/auth/hooks/use-user-profile.ts:19`
  - `src/features/auth/hooks/use-user-profile.ts:25`
- Evidence:
  ```tsx
  <SWRConfig value={{ provider: localStorageProvider }}>
  ```
  ```ts
  const map = new Map<string, State<unknown>>(
    JSON.parse(localStorage.getItem(CACHE_KEY) || "[]"),
  );
  ...
  localStorage.setItem(CACHE_KEY, appCache);
  ```
  ```ts
  // Fetches current user's profile (first_name, email)
  useSWR<UserProfile>(`${USER_API_BASE}/me`, ...)
  ```
- Impact:
  - PII and authenticated API responses remain at-rest in browser storage.
  - Any XSS or local device compromise can read cached sensitive data.
- Fix:
  - Use default in-memory SWR provider for authenticated data.
  - If persistence is required, persist only non-sensitive keys with strict allowlist and TTL.
- Mitigation:
  - Purge cache on login/logout and on user switch; add versioned cache invalidation.
- False positive notes:
  - If the app intentionally accepts this tradeoff for UX, document it and narrowly scope persisted keys.

### [F-003] Unvalidated URL Rendering and Opening from Model/Backend Message Data

- Rule IDs: `REACT-URL-001`, `JS-URL-001`, `JS-URL-002`
- Severity: Medium
- Location:
  - `src/features/thread/components/messages/ai/utils.ts:82`
  - `src/features/thread/components/messages/ai/utils.ts:95`
  - `src/features/thread/components/messages/ai/sources-list.tsx:145`
  - `src/features/thread/components/messages/ai/sources-list.tsx:75`
  - `src/features/thread/components/markdown/utils/citation-renumbering.ts:12`
  - `src/features/thread/components/markdown/utils/citation-renumbering.ts:123`
- Evidence:
  ```ts
  const url = asNonEmptyString(sourceLike.url);
  ...
  source.url = url;
  ```
  ```tsx
  <a href={source.url} target="_blank" rel="noopener noreferrer">
  ```
  ```tsx
  window.open(presignedUrl, "_blank", "noopener,noreferrer");
  ```
  ```ts
  if (source?.type === "web" && source.url) {
    return source.url;
  }
  ```
- Impact:
  - Untrusted URLs can drive user navigation to malicious destinations.
  - Without protocol/domain allowlisting, phishing and unsafe scheme abuse risks increase.
- Fix:
  - Centralize URL validation helper using `new URL(...)`:
    - allow only `https:` (and optionally `http:` for localhost/dev),
    - optionally enforce allowlisted hostnames for presigned URLs and source links.
  - Reject or render as plain text when URL fails validation.
- Mitigation:
  - Keep `noopener noreferrer` (already present) and add explicit user-visible host display/confirmation for external destinations.
- False positive notes:
  - `rel="noopener noreferrer"` reduces opener abuse but does not validate destination trust.

### [F-004] CSP Not Visible in Deployment Config (Defense-in-Depth Gap)

- Rule IDs: `REACT-CSP-001`, `JS-CSP-001`
- Severity: Medium
- Location:
  - `vercel.json:8`
  - `vercel.json:13`
  - `vercel.json:17`
  - `index.html:14`
- Evidence:
  ```json
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
  ```
  ```html
  <!-- Security Headers (CSP will be handled by server/proxy) -->
  ```
- Impact:
  - Missing/unknown CSP weakens impact reduction for future XSS/markup handling bugs.
- Fix:
  - Define CSP at edge/server (preferred) with a least-privilege policy, e.g.:
    - `default-src 'self'`
    - `script-src 'self'`
    - `object-src 'none'`
    - `base-uri 'self'`
    - `frame-ancestors 'none'`
    - `connect-src` limited to required API/Auth0/Sentry endpoints.
- Mitigation:
  - Start in report-only mode, then enforce.
- False positive notes:
  - CSP may exist in external platform settings not present in repo; verify runtime response headers in production.

## Low Severity

### [F-005] CI Uses Non-Frozen Dependency Installs

- Rule IDs: `REACT-SUPPLY-001`
- Severity: Low
- Location:
  - `.github/workflows/ci.yml:35`
  - `.github/workflows/ci.yml:52`
- Evidence:
  ```yaml
  - name: Install dependencies
    run: pnpm install
  ```
- Impact:
  - Dependency resolution drift can reduce reproducibility and increase supply-chain surprise risk.
- Fix:
  - Use `pnpm install --frozen-lockfile` in CI.
  - Optionally add automated dependency review/audit gates.
- Mitigation:
  - Keep lockfile committed (already present: `pnpm-lock.yaml`) and enforce branch protections.
- False positive notes:
  - Current lockfile presence lowers risk; this is a hardening recommendation.

## Additional Notes

- `pnpm audit --prod --audit-level=high` result: `No known vulnerabilities found` (run on March 6, 2026).
- No direct use of high-risk sinks like `dangerouslySetInnerHTML`, `eval`, `new Function`, or `document.write` was found in the audited frontend source paths.
