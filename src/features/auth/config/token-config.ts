/**
 * Dynamic token timing configuration
 * All timing constants are calculated from the actual token expiration time
 *
 * This follows Auth0 best practices:
 * - Read expiration from the JWT's exp claim (via expiresAt from getAccessToken())
 * - Calculate refresh intervals dynamically based on actual token lifetime
 * - Use appropriate buffer periods to handle network latency
 */

/**
 * Default buffer period for latency mitigation (seconds)
 * Auth0 recommends 30-90 seconds for latency-sensitive operations
 * @see https://github.com/auth0/nextjs-auth0/blob/main/EXAMPLES.md#mitigating-token-expiration-race-conditions-in-latency-sensitive-operations
 */
export const DEFAULT_LATENCY_BUFFER_SECONDS = 60;

/**
 * Token timing configuration calculated from actual token expiration
 */
export interface TokenTimings {
  /** Actual token lifetime in seconds (from issue to expiration) */
  lifetimeSeconds: number;

  /** How often to check/refresh the token in background (2/3 of lifetime) */
  refreshIntervalSeconds: number;

  /** Buffer time before expiry to consider token "expiring soon" */
  expiryBufferSeconds: number;

  /** Minimal buffer for urgent checks */
  minimalBufferSeconds: number;

  /** Refresh interval in milliseconds for JavaScript timers */
  refreshIntervalMs: number;
}

/**
 * Calculate token timing configuration from actual token expiration
 *
 * @param expiresAt - Unix timestamp (seconds since epoch) when token expires
 * @returns Token timing configuration
 *
 * @example
 * ```typescript
 * const { expiresAt } = await fetch('/api/auth/token').then(r => r.json());
 * const timings = calculateTokenTimings(expiresAt);
 *
 * // Schedule refresh at 2/3 of token lifetime
 * setInterval(() => refreshToken(), timings.refreshIntervalMs);
 * ```
 */
export function calculateTokenTimings(expiresAt: number): TokenTimings {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const lifetimeSeconds = Math.max(0, expiresAt - now); // Remaining lifetime

  // Use Auth0's recommended buffer for short-lived tokens (< 5 minutes)
  // For longer tokens, use proportional buffer (1/5 of lifetime)
  const expiryBufferSeconds =
    lifetimeSeconds < 300
      ? Math.min(DEFAULT_LATENCY_BUFFER_SECONDS, lifetimeSeconds * 0.5)
      : Math.floor(lifetimeSeconds / 5);

  return {
    lifetimeSeconds,

    // Refresh at 2/3 of remaining lifetime
    refreshIntervalSeconds: Math.floor(lifetimeSeconds * (2 / 3)),

    // Buffer for considering token "expiring soon"
    expiryBufferSeconds,

    // Minimal buffer for urgent checks (1/15 of lifetime or 10 seconds, whichever is smaller)
    minimalBufferSeconds: Math.min(10, Math.floor(lifetimeSeconds / 15)),

    // Convert to milliseconds for JavaScript timers
    refreshIntervalMs: Math.floor(lifetimeSeconds * (2 / 3) * 1000),
  };
}
