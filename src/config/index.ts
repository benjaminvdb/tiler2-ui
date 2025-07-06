/**
 * Configuration entry point
 * Re-exports appropriate config for the current environment
 */

// Export client-side config
export { getClientConfig, DEFAULT_CLIENT_CONFIG } from "./client";
export type { ClientConfig } from "./client";

// Export app-wide config (safe for both client and server)
export { AUTH_CONFIG, APP_CONFIG, isDevelopment, isProduction } from "./app";

// Server config is NOT re-exported here to prevent accidental client-side usage
// Import directly from "./server" when needed in server-side code