/**
 * Browser-safe configuration entry point.
 * Import server-only settings directly from their modules to avoid bundling secrets.
 */
export { getClientConfig, DEFAULT_CLIENT_CONFIG } from "./client";
export type { ClientConfig } from "./client";

export { AUTH_CONFIG, APP_CONFIG, isDevelopment, isProduction } from "./app";
