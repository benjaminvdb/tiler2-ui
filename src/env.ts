/**
 * Environment variable validation with runtime checks and type safety.
 * Client variables are prefixed with VITE_ to be exposed to the browser.
 */

import { z } from "zod";

const createEnv = () => {
  const clientSchema = z.object({
    VITE_AUTH0_DOMAIN: z.string().min(1),
    VITE_AUTH0_CLIENT_ID: z.string().min(1),
    VITE_AUTH0_AUDIENCE: z.url().optional(),
    VITE_API_URL: z.string().optional(),
    VITE_ASSISTANT_ID: z.string().optional(),
    VITE_SENTRY_DSN: z.url().optional(),
    VITE_APP_BASE_URL: z.url(),
  });

  const skipValidation = import.meta.env.VITE_SKIP_ENV_VALIDATION === "true";

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
      });

  return {
    AUTH0_DOMAIN: clientEnv.VITE_AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: clientEnv.VITE_AUTH0_CLIENT_ID,
    AUTH0_AUDIENCE: clientEnv.VITE_AUTH0_AUDIENCE,
    API_URL: clientEnv.VITE_API_URL,
    ASSISTANT_ID: clientEnv.VITE_ASSISTANT_ID,
    SENTRY_DSN: clientEnv.VITE_SENTRY_DSN,
    APP_BASE_URL: clientEnv.VITE_APP_BASE_URL,
  };
};

export const env = createEnv();
