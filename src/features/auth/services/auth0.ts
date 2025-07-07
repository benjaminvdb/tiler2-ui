import { Auth0Client } from "@auth0/nextjs-auth0/server";
import type { NextRequest } from "next/server";
import { AUTH0_CONFIG } from "./auth0-config";

// Auth0 environment variables (no validation at module level)
const auth0EnvVars = {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  AUTH0_SECRET: process.env.AUTH0_SECRET,
  APP_BASE_URL: process.env.APP_BASE_URL,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
} as const;

/**
 * Runtime validation for Auth0 configuration
 * Returns validation result instead of throwing
 */
export function validateAuth0Config(): {
  isValid: boolean;
  errors: string[];
  config?: typeof auth0EnvVars;
} {
  const errors: string[] = [];

  // Check required environment variables
  const requiredVars = [
    "AUTH0_DOMAIN",
    "AUTH0_CLIENT_ID",
    "AUTH0_CLIENT_SECRET",
    "AUTH0_SECRET",
    "APP_BASE_URL",
  ] as const;

  for (const varName of requiredVars) {
    if (!auth0EnvVars[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate URL format if APP_BASE_URL is provided
  if (auth0EnvVars.APP_BASE_URL) {
    try {
      const callbackUrl = `${auth0EnvVars.APP_BASE_URL}/auth/callback`;
      new URL(callbackUrl);
    } catch {
      errors.push(`Invalid APP_BASE_URL format: ${auth0EnvVars.APP_BASE_URL}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    ...(errors.length === 0 ? { config: auth0EnvVars } : {}),
  };
}

/**
 * Check if Auth0 is properly configured
 */
export function isAuth0Configured(): boolean {
  return validateAuth0Config().isValid;
}

/**
 * Get Auth0 client instance with runtime validation
 * Returns null if configuration is invalid
 */
export function getAuth0Client(): Auth0Client | null {
  const validation = validateAuth0Config();

  if (!validation.isValid) {
    // In development, log the errors for easier debugging
    if (process.env.NODE_ENV === "development") {
      console.warn("Auth0 configuration invalid:", validation.errors);
    }
    return null;
  }

  const config = validation.config!;
  const callbackUrl = `${config.APP_BASE_URL}/auth/callback`;

  return new Auth0Client({
    authorizationParameters: {
      redirect_uri: callbackUrl,
      ...AUTH0_CONFIG.authorizationParams,
      ...(config.AUTH0_AUDIENCE ? { audience: config.AUTH0_AUDIENCE } : {}),
    },
    session: AUTH0_CONFIG.session,
  });
}

// Lazy initialization - only create client when actually needed
let _auth0Client: Auth0Client | null | undefined;

/**
 * Get the Auth0 client instance (cached)
 * Returns null if Auth0 is not properly configured
 */
export function getAuth0(): Auth0Client | null {
  if (_auth0Client === undefined) {
    _auth0Client = getAuth0Client();
  }
  return _auth0Client;
}

/**
 * Auth0 middleware wrapper with graceful degradation
 */
export async function auth0Middleware(
  request: NextRequest,
): Promise<Response | null> {
  const client = getAuth0();

  if (!client) {
    // Auth0 not configured - allow request to proceed without auth
    if (process.env.NODE_ENV === "development") {
      console.warn("Auth0 not configured, skipping authentication");
    }
    return null;
  }

  try {
    return await client.middleware(request);
  } catch (error) {
    // Log error but don't crash the app
    console.error("Auth0 middleware error:", error);
    return null;
  }
}

/**
 * Get session with graceful error handling
 */
export async function getAuth0Session(request: NextRequest) {
  const client = getAuth0();

  if (!client) {
    return null;
  }

  try {
    return await client.getSession(request);
  } catch (error) {
    console.error("Error getting Auth0 session:", error);
    return null;
  }
}
