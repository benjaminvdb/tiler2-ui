/**
 * Client-side Auth0 utilities for graceful degradation
 */
import React from "react";
import { observability } from "@/core/services/observability";
import { env } from "@/env";

const logger = observability.child({
  component: "auth0-client",
});

const isDevelopment = import.meta.env.MODE === "development";

// eslint-disable-next-line react-refresh/only-export-components
export function isAuth0ConfiguredClient(): boolean {
  return Boolean(env.AUTH0_DOMAIN && env.AUTH0_CLIENT_ID);
}

// eslint-disable-next-line react-refresh/only-export-components
export function warnAuth0NotConfigured(): void {
  if (!isDevelopment || isAuth0ConfiguredClient()) {
    return;
  }

  logger.warn("Auth0 not configured - running without authentication", {
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
  });
}

export const Auth0DevStatus = (): React.JSX.Element | null => {
  if (!isDevelopment || isAuth0ConfiguredClient()) {
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
};
