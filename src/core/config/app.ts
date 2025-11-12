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
    "A modern React application with real-time streaming chat interface for AI-powered sustainability analysis and environmental impact assessment via LangGraph multi-agent systems",
} as const;

// Environment detection
export const isDevelopment = import.meta.env.MODE === "development";
export const isProduction = import.meta.env.MODE === "production";
