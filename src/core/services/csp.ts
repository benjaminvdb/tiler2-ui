
/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

/**
 * Generate Content Security Policy header based on environment
 */
export function generateCSP(nonce: string): string {
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

  // Add development sources
  if (!isProduction) {
    connectSources.push("localhost:*", "127.0.0.1:*", "ws://localhost:*");
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

  // Build the CSP header
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'nonce-${nonce}' fonts.googleapis.com`,
    `font-src 'self' fonts.gstatic.com`,
    `img-src 'self' data: blob: *.auth0.com`,
    `connect-src ${connectSources.join(" ")}`,
    `frame-src 'self' *.auth0.com`,
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
    monitoring: ["*.sentry.io", "*.datadoghq.com"],
  },
} as const;