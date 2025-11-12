/**
 * Client-side Auth0 utilities for graceful degradation
 */
import React from "react";
import { observability } from "@/core/services/observability";

const logger = observability.child({
  component: "auth0-client",
});

/**
 * Check if Auth0 is configured in the client environment
 * This is a basic check based on public environment variables
 */
export function isAuth0ConfiguredClient(): boolean {
  // Check for Auth0 public configuration
  const hasPublicVars =
    (typeof window !== "undefined" &&
      window.location.hostname !== "localhost") ||
    import.meta.env.MODE === "production";

  // In development, we might not have Auth0 configured
  if (import.meta.env.MODE === "development" && !hasPublicVars) {
    return false;
  }
  return true;
}
/**
 * Show a development warning for missing Auth0 configuration
 */
export function warnAuth0NotConfigured(): void {
  if (import.meta.env.MODE === "development") {
    logger.warn(
      "Auth0 not configured - running in development mode without authentication",
      {
        operation: "auth0_config_check",
        additionalData: {
          requiredVars: [
            "AUTH0_DOMAIN",
            "AUTH0_CLIENT_ID",
            "AUTH0_CLIENT_SECRET",
            "AUTH0_SECRET",
            "APP_BASE_URL",
          ],
        },
      },
    );
  }
}
/**
 * Development component to show Auth0 status
 */
export function Auth0DevStatus(): React.JSX.Element | null {
  if (import.meta.env.MODE !== "development") {
    return null;
  }
  const isConfigured = isAuth0ConfiguredClient();

  if (isConfigured) {
    return null;
  }
  return (
    <div className="fixed right-4 bottom-4 z-50 rounded-lg border border-yellow-400 bg-yellow-100 p-3 text-sm shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-yellow-600">⚠️</span>
        <span className="text-yellow-800">Auth0 not configured (dev mode)</span>
      </div>
    </div>
  );
}
