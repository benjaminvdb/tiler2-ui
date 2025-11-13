import { env } from "@/env";

export interface ClientConfig {
  apiUrl: string;
  assistantId: string;
}

export function getClientConfig(): ClientConfig {
  return {
    apiUrl: env.API_URL || "http://localhost:2024",
    assistantId: env.ASSISTANT_ID || "assistant",
  };
}

export const DEFAULT_CLIENT_CONFIG = {
  apiUrl: "http://localhost:2024",
  assistantId: "assistant",
} as const;
