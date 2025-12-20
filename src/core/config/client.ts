/**
 * Client configuration for API endpoints and assistant settings.
 */

import { env } from "@/env";

export interface ClientConfig {
  apiUrl: string;
  assistantId: string;
}

/** Returns resolved client config with defaults for local development. */
export function getClientConfig(): ClientConfig {
  return {
    apiUrl: env.API_URL || "http://localhost:2024",
    assistantId: env.ASSISTANT_ID || "assistant",
  };
}
