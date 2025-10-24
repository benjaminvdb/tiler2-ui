/**
 * Environment variable validation and type-safe access
 *
 * This file provides:
 * - Runtime validation of environment variables
 * - TypeScript type safety
 * - Clear separation of client/server variables
 * - Automatic env overrides from deployment platforms
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables
   * These are NEVER exposed to the browser
   */
  server: {
    // Auth0 Configuration
    AUTH0_SECRET: z.string().min(32, "AUTH0_SECRET must be at least 32 characters"),
    AUTH0_DOMAIN: z.string().min(1),
    AUTH0_CLIENT_ID: z.string().min(1),
    AUTH0_CLIENT_SECRET: z.string().min(1),
    AUTH0_AUDIENCE: z.url().optional(),
    APP_BASE_URL: z.url(),

    // LangGraph Server Configuration
    LANGGRAPH_API_URL: z.string().optional(),
    LANGSMITH_API_KEY: z.string().optional(),
  },

  /**
   * Client-side environment variables
   * These ARE exposed to the browser (via NEXT_PUBLIC_ prefix)
   */
  client: {
    NEXT_PUBLIC_API_URL: z.string().optional(),
    NEXT_PUBLIC_ASSISTANT_ID: z.string().optional(),
  },

  /**
   * Runtime environment mapping
   * You must destructure all variables explicitly for Next.js to bundle them
   */
  runtimeEnv: {
    // Server
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
    APP_BASE_URL: process.env.APP_BASE_URL,
    LANGGRAPH_API_URL: process.env.LANGGRAPH_API_URL,
    LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY,

    // Client
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ASSISTANT_ID: process.env.NEXT_PUBLIC_ASSISTANT_ID,
  },

  /**
   * Skip validation during build for better DX
   * Set to false in CI/production
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes it easier to debug validation errors
   */
  emptyStringAsUndefined: true,
});
