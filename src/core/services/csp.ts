import { env } from "@/env";

/**
 * Generate a cryptographically secure nonce for 
 */
export function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

/**
 * Generate Content Security Policy header based on environment
 */
export function generateCSP(): string {
  const isProduction = import.meta.env.MODE === "production";
  const apiUrl = env.API_URL || "";

  const getOrigin = (url: string) => {
    try {
      return new URL(url).origin;
    } catch {
      return "";
    }
  };

  const connectSources = [
    "'self'",
    "smith.langchain.com",
    "*.auth0.com",
    "*.langgraph.app",
  ];

  const scriptSources = ["'self'", "'unsafe-inline'"];

  if (isProduction) {
    scriptSources.push("https://vercel.live");
  }

  if (!isProduction) {
    connectSources.push("localhost:*", "127.0.0.1:*", "ws://localhost:*");
    scriptSources.push("'unsafe-eval'");
  }

  if (apiUrl) {
    const origin = getOrigin(apiUrl);
    if (origin) {
      connectSources.push(origin);
      connectSources.push(origin.replace("https://", "wss://"));
    }
  }

  connectSources.push("*.ingest.sentry.io", "*.sentry.io");

  const cspDirectives = [
    `default-src 'self'`,
    `script-src ${scriptSources.join(" ")}`,
    `style-src 'self' 'unsafe-inline' fonts.googleapis.com`,
    `font-src 'self' fonts.gstatic.com`,
    `img-src 'self' data: blob: *.auth0.com https://s.gravatar.com https://cdn.auth0.com https://i2.wp.com`,
    `connect-src ${connectSources.join(" ")}`,
    `frame-src 'self' *.auth0.com https://vercel.live`,
    `worker-src 'self' blob:`,
    `child-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ];

  return cspDirectives.join("; ");
}

/**
 * CSP configuration for different environments
 */
export const CSP_CONFIG = {
  REQUIRED_DOMAINS: {
    fonts: ["fonts.googleapis.com", "fonts.gstatic.com"],
    auth: ["*.auth0.com"],
    langgraph: ["smith.langchain.com", "*.langgraph.app"],
  },
  OPTIONAL_DOMAINS: {
    monitoring: ["*.sentry.io", "*.ingest.sentry.io"],
  },
} as const;
