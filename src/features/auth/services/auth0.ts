/**
 * Auth0 configuration and utilities for SPA
 * Replaces Next.js Auth0 SDK with browser-based Auth0 React SDK
 */

import { env } from "@/env";

/**
 * Check if Auth0 is properly configured
 */
export function isAuth0Configured(): boolean {
  return !!(env.AUTH0_DOMAIN && env.AUTH0_CLIENT_ID);
}

/**
 * Get Auth0 configuration for SPA
 */
export function getAuth0Config() {
  return {
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    audience: env.AUTH0_AUDIENCE,
  };
}

// These functions are no longer needed in the SPA version
// as Auth0Provider from @auth0/auth0-react handles authentication automatically
// Keep them for compatibility with existing code
export const auth0 = null as any;
export const getAuth0 = () => null;
