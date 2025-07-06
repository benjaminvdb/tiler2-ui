/**
 * Central configuration for the application
 * This file consolidates all configuration constants and environment variables
 */

// Default API configuration
export const DEFAULT_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:2024";
export const DEFAULT_ASSISTANT_ID =
  process.env.NEXT_PUBLIC_ASSISTANT_ID || "agent";

// API Configuration
export const API_CONFIG = {
  defaultUrl: DEFAULT_API_URL,
  defaultAssistantId: DEFAULT_ASSISTANT_ID,
  langgraphApiUrl: process.env.LANGGRAPH_API_URL,
  langsmithApiKey: process.env.LANGSMITH_API_KEY,
} as const;

// Authentication configuration
export const AUTH_CONFIG = {
  loginUrl: "/auth/login",
} as const;

// Application configuration
export const APP_CONFIG = {
  name: "Link Chat",
  description:
    "A Next.js application that provides a chat interface for interacting with LangGraph servers",
} as const;

// Environment helpers
export const isDevelopment = process.env.NODE_ENV === "development";
export const isProduction = process.env.NODE_ENV === "production";
