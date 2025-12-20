/**
 * Centralized authentication helpers for triggering auth actions outside React components.
 * Uses direct DOM manipulation and Auth0 logout endpoint for compatibility.
 */

import { env } from "@/env";
import { reportAuthError } from "./observability";

/** Logs out user by redirecting to Auth0 logout endpoint and clearing localStorage. */
export const triggerLogout = (returnTo?: string, reason?: string): void => {
  if (reason) {
    reportAuthError(new Error(`Logout triggered: ${reason}`), {
      operation: "triggerLogout",
      component: "auth-helpers",
      additionalData: {
        severity: "high",
        reason,
      },
    });
  }

  const logoutUrl = new URL(`https://${env.AUTH0_DOMAIN}/v2/logout`);
  logoutUrl.searchParams.set("client_id", env.AUTH0_CLIENT_ID);
  logoutUrl.searchParams.set("returnTo", returnTo || window.location.origin);

  localStorage.clear();
  window.location.href = logoutUrl.toString();
};

/** Initiates Auth0 login flow by redirecting to the authorize endpoint. */
export const triggerLogin = (): void => {
  const loginUrl = new URL(`https://${env.AUTH0_DOMAIN}/authorize`);
  loginUrl.searchParams.set("client_id", env.AUTH0_CLIENT_ID);
  loginUrl.searchParams.set("response_type", "code");
  loginUrl.searchParams.set(
    "redirect_uri",
    `${window.location.origin}/auth/callback`,
  );
  loginUrl.searchParams.set("scope", "openid profile email");
  if (env.AUTH0_AUDIENCE) {
    loginUrl.searchParams.set("audience", env.AUTH0_AUDIENCE);
  }

  window.location.href = loginUrl.toString();
};
