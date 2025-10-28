/**
 * Environment variable validation with runtime checks and type safety.
 * Server variables are never exposed to the browser.
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side only - never exposed to browser
   */
  server: {
    AUTH0_SECRET: z
      .string()
      .min(32, "AUTH0_SECRET must be at least 32 characters"),
    AUTH0_DOMAIN: z.string().min(1),
    AUTH0_CLIENT_ID: z.string().min(1),
    AUTH0_CLIENT_SECRET: z.string().min(1),
    AUTH0_AUDIENCE: z.url().optional(),
    APP_BASE_URL: z.url(),
    LANGSMITH_API_KEY: z.string().optional(),
    SENTRY_DSN: z.url().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_ENVIRONMENT: z
      .enum(["development", "test", "production"])
      .optional(),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).optional(),
    LOG_PRETTY: z.string().optional(),
  },

  /**
   * Client-side - exposed to browser via NEXT_PUBLIC_ prefix
   */
  client: {
    NEXT_PUBLIC_API_URL: z.string().optional(),
    NEXT_PUBLIC_ASSISTANT_ID: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
  },

  /**
   * Explicitly destructure all env vars for Next.js bundling.
   */
  runtimeEnv: {
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    APP_BASE_URL: process.env.APP_BASE_URL,
    LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
    LOG_LEVEL: process.env.LOG_LEVEL,
    LOG_PRETTY: process.env.LOG_PRETTY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ASSISTANT_ID: process.env.NEXT_PUBLIC_ASSISTANT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
