/**
 * Client-side Auth0 utilities for graceful degradation
 */
import React from "react";

/**
 * Check if Auth0 is configured in the client environment
 * This is a basic check based on public environment variables
 */
export function isAuth0ConfiguredClient(): boolean {
  // Check for Auth0 public configuration
  const hasPublicVars =
    (typeof window !== "undefined" &&
      window.location.hostname !== "localhost") ||
    process.env.NODE_ENV === "production";

  // In development, we might not have Auth0 configured
  if (process.env.NODE_ENV === "development" && !hasPublicVars) {
    return false;
  }
  return true;
}
/**
 * Show a development warning for missing Auth0 configuration
 */
export function warnAuth0NotConfigured(): void {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "🔐 Auth0 not configured. The app will work without authentication in development mode.\n" +
        "To enable authentication, set the following environment variables:\n" +
        "- AUTH0_DOMAIN\n" +
        "- AUTH0_CLIENT_ID\n" +
        "- AUTH0_CLIENT_SECRET\n" +
        "- AUTH0_SECRET\n" +
        "- APP_BASE_URL",
    );
  }
}
/**
 * Development component to show Auth0 status
 */
export function Auth0DevStatus(): React.JSX.Element | null {
  if (process.env.NODE_ENV !== "development") {
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
