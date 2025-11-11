/**
 * Client-side configuration
 * Uses Vite environment variables that are safe to expose to the browser
 */

import { env } from "@/env";

export interface ClientConfig {
  apiUrl: string;
  assistantId: string;
}

/**
 * Get client-side configuration
 * This function can be called from browser code
 */
export function getClientConfig(): ClientConfig {
  return {
    apiUrl: env.API_URL || "http://localhost:2024",
    assistantId: env.ASSISTANT_ID || "agent",
  };
}

/**
 * Default values for client configuration
 * These are used as fallbacks in the configuration form
 */
export const DEFAULT_CLIENT_CONFIG = {
  apiUrl: "http://localhost:2024",
  assistantId: "agent",
} as const;
