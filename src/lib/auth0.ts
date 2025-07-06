import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Validate required Auth0 environment variables
const requiredEnvVars = {
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  AUTH0_SECRET: process.env.AUTH0_SECRET,
  APP_BASE_URL: process.env.APP_BASE_URL,
} as const;

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Validate and sanitize callback URL
const baseUrl = requiredEnvVars.APP_BASE_URL;
const callbackUrl = `${baseUrl}/auth/callback`;

// Validate URL format
try {
  new URL(callbackUrl);
} catch (error) {
  throw new Error(`Invalid APP_BASE_URL format: ${baseUrl}`);
}

// Initialize the Auth0 client with validated environment variables
export const auth0 = new Auth0Client({
  authorizationParameters: {
    redirect_uri: callbackUrl,
    audience: process.env.AUTH0_AUDIENCE || null,
  },
});
