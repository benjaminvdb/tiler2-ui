/**
 * Application-wide configuration
 * Contains static configuration that doesn't depend on environment variables
 */

// Authentication configuration
export const AUTH_CONFIG = {
  loginUrl: "/auth/login",
} as const;

// Application metadata
export const APP_CONFIG = {
  name: "Link Chat",
  description:
    "A Next.js application that provides a chat interface for interacting with LangGraph servers",
} as const;

// Environment detection
export const isDevelopment = import.meta.env.MODE === "development";
export const isProduction = import.meta.env.MODE === "production";
