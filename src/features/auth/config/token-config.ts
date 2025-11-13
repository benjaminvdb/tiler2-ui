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
 * const { getToken } = useAccessToken();
 * const token = await getToken();
 * Parse token expiration from the JWT or use Auth0 SDK's token metadata
 * const timings = calculateTokenTimings(expiresAt);
 *
 * Schedule a refresh timer using the helper output
 * setInterval(() => refreshToken(), timings.refreshIntervalMs);
 * ```
 */
export function calculateTokenTimings(expiresAt: number): TokenTimings {
  const now = Math.floor(Date.now() / 1000);
  const lifetimeSeconds = Math.max(0, expiresAt - now);
  const expiryBufferSeconds =
    lifetimeSeconds < SHORT_LIVED_TOKEN_SECONDS
      ? Math.min(DEFAULT_LATENCY_BUFFER_SECONDS, lifetimeSeconds * 0.5)
      : Math.floor(lifetimeSeconds / 5);
  const refreshIntervalSeconds = Math.floor(lifetimeSeconds * REFRESH_RATIO);
  const minimalBufferSeconds = Math.min(
    MAX_MINIMAL_BUFFER_SECONDS,
    Math.floor(lifetimeSeconds * URGENT_BUFFER_RATIO),
  );

  return {
    lifetimeSeconds,
    refreshIntervalSeconds,
    expiryBufferSeconds,
    minimalBufferSeconds,
    refreshIntervalMs: Math.floor(refreshIntervalSeconds * 1000),
  };
}
const REFRESH_RATIO = 2 / 3;
const URGENT_BUFFER_RATIO = 1 / 15;
const SHORT_LIVED_TOKEN_SECONDS = 300;
const MAX_MINIMAL_BUFFER_SECONDS = 10;
