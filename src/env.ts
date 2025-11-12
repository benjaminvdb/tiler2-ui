/**
 * Environment variable validation with runtime checks and type safety.
 * Client variables are prefixed with VITE_ to be exposed to the browser.
 */

import { z } from "zod";

const createEnv = () => {
  // Client-side environment variables (exposed to browser via VITE_ prefix)
  const clientSchema = z.object({
    VITE_AUTH0_DOMAIN: z.string().min(1),
    VITE_AUTH0_CLIENT_ID: z.string().min(1),
    VITE_AUTH0_AUDIENCE: z.url().optional(),
    VITE_API_URL: z.string().optional(),
    VITE_ASSISTANT_ID: z.string().optional(),
    VITE_SENTRY_DSN: z.url().optional(),
    VITE_APP_BASE_URL: z.url(),
    // Error reporting configuration
    VITE_DATADOG_API_KEY: z.string().optional(),
    VITE_LOGROCKET_APP_ID: z.string().optional(),
    VITE_BUGSNAG_API_KEY: z.string().optional(),
    VITE_ERROR_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
    VITE_ERROR_WEBHOOK_API_KEY: z.string().optional(),
    VITE_ENABLE_CONSOLE_LOGGING: z.string().optional(),
    VITE_ENABLE_PERFORMANCE_TRACKING: z.string().optional(),
    VITE_MAX_ERRORS_PER_SESSION: z.string().optional(),
  });

  const skipValidation = import.meta.env.VITE_SKIP_ENV_VALIDATION === "true";

  // Validate client-side variables (always available in browser)
  const clientEnv = skipValidation
    ? (import.meta.env as any)
    : clientSchema.parse({
        VITE_AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN,
        VITE_AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID,
        VITE_AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE,
        VITE_API_URL: import.meta.env.VITE_API_URL,
        VITE_ASSISTANT_ID: import.meta.env.VITE_ASSISTANT_ID,
        VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
        VITE_APP_BASE_URL: import.meta.env.VITE_APP_BASE_URL,
        VITE_DATADOG_API_KEY: import.meta.env.VITE_DATADOG_API_KEY,
        VITE_LOGROCKET_APP_ID: import.meta.env.VITE_LOGROCKET_APP_ID,
        VITE_BUGSNAG_API_KEY: import.meta.env.VITE_BUGSNAG_API_KEY,
        VITE_ERROR_WEBHOOK_URL: import.meta.env.VITE_ERROR_WEBHOOK_URL,
        VITE_ERROR_WEBHOOK_API_KEY: import.meta.env.VITE_ERROR_WEBHOOK_API_KEY,
        VITE_ENABLE_CONSOLE_LOGGING: import.meta.env
          .VITE_ENABLE_CONSOLE_LOGGING,
        VITE_ENABLE_PERFORMANCE_TRACKING: import.meta.env
          .VITE_ENABLE_PERFORMANCE_TRACKING,
        VITE_MAX_ERRORS_PER_SESSION: import.meta.env
          .VITE_MAX_ERRORS_PER_SESSION,
      });

  return {
    // Client-side variables (available in browser)
    AUTH0_DOMAIN: clientEnv.VITE_AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: clientEnv.VITE_AUTH0_CLIENT_ID,
    AUTH0_AUDIENCE: clientEnv.VITE_AUTH0_AUDIENCE,
    API_URL: clientEnv.VITE_API_URL,
    ASSISTANT_ID: clientEnv.VITE_ASSISTANT_ID,
    SENTRY_DSN: clientEnv.VITE_SENTRY_DSN,
    APP_BASE_URL: clientEnv.VITE_APP_BASE_URL,
    // Error reporting configuration
    DATADOG_API_KEY: clientEnv.VITE_DATADOG_API_KEY,
    LOGROCKET_APP_ID: clientEnv.VITE_LOGROCKET_APP_ID,
    BUGSNAG_API_KEY: clientEnv.VITE_BUGSNAG_API_KEY,
    ERROR_WEBHOOK_URL: clientEnv.VITE_ERROR_WEBHOOK_URL,
    ERROR_WEBHOOK_API_KEY: clientEnv.VITE_ERROR_WEBHOOK_API_KEY,
    ENABLE_CONSOLE_LOGGING: clientEnv.VITE_ENABLE_CONSOLE_LOGGING,
    ENABLE_PERFORMANCE_TRACKING: clientEnv.VITE_ENABLE_PERFORMANCE_TRACKING,
    MAX_ERRORS_PER_SESSION: clientEnv.VITE_MAX_ERRORS_PER_SESSION,
  };
};

export const env = createEnv();
