/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

/**
 * Generate Content Security Policy header based on environment
 */
export function generateCSP(): string {
  // Determine the appropriate domains based on environment
  const isProduction = process.env.NODE_ENV === "production";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const langgraphUrl = process.env.LANGGRAPH_API_URL || "";

  // Extract domain from URLs for connect-src
  const getOrigin = (url: string) => {
    try {
      return new URL(url).origin;
    } catch {
      return "";
    }
  };

  // Build connect-src based on actual configuration
  const connectSources = [
    "'self'",
    "smith.langchain.com",
    "*.auth0.com",
    "*.langgraph.app",
  ];

  // Build script-src with external domains
  const scriptSources = ["'self'", "'unsafe-inline'"];

  // Add Vercel Live for feedback/analytics if deployed on Vercel
  if (isProduction) {
    scriptSources.push("https://vercel.live");
  }

  // Add development sources
  if (!isProduction) {
    connectSources.push("localhost:*", "127.0.0.1:*", "ws://localhost:*");
    scriptSources.push("'unsafe-eval'");
  }

  // Add production API domains
  if (apiUrl) {
    connectSources.push(getOrigin(apiUrl));
  }
  if (langgraphUrl) {
    connectSources.push(getOrigin(langgraphUrl));
    // Add WebSocket variant
    connectSources.push(langgraphUrl.replace("https://", "wss://"));
  }

  // Add Sentry domains to connect-src
  connectSources.push("*.ingest.sentry.io", "*.sentry.io");

  // Build the CSP header with fallbacks for Next.js compatibility
  const cspDirectives = [
    `default-src 'self'`,
    // Use script sources with external domains
    `script-src ${scriptSources.join(" ")}`,
    // Remove nonce from styles to allow unsafe-inline to work
    `style-src 'self' 'unsafe-inline' fonts.googleapis.com`,
    `font-src 'self' fonts.gstatic.com`,
    // Add image sources for Auth0 profile images
    `img-src 'self' data: blob: *.auth0.com https://s.gravatar.com https://cdn.auth0.com https://i2.wp.com`,
    `connect-src ${connectSources.join(" ")}`,
    `frame-src 'self' *.auth0.com https://vercel.live`,
    // Allow workers for Session Replay (Sentry)
    `worker-src 'self' blob:`,
    // Safari <= 15.4 fallback for worker-src
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
  // Required domains that must always be allowed
  REQUIRED_DOMAINS: {
    fonts: ["fonts.googleapis.com", "fonts.gstatic.com"],
    auth: ["*.auth0.com"],
    langgraph: ["smith.langchain.com", "*.langgraph.app"],
  },
  // Optional domains for monitoring services
  OPTIONAL_DOMAINS: {
    monitoring: ["*.sentry.io", "*.ingest.sentry.io", "*.datadoghq.com"],
  },
} as const;
