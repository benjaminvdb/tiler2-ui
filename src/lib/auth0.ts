import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Initialize the Auth0 client
export const auth0 = new Auth0Client({
  // Options are loaded from environment variables by default
  // Required environment variables:
  // AUTH0_DOMAIN (e.g., 'example.us.auth0.com')
  // AUTH0_CLIENT_ID
  // AUTH0_CLIENT_SECRET
  // AUTH0_SECRET (use `openssl rand -hex 32` to generate)
  // APP_BASE_URL (e.g., 'http://localhost:3000')
  
  // Explicitly set the callback URL to match what's configured in Auth0 dashboard
  authorizationParameters: {
    scope: 'openid profile email',
    // Explicitly set the redirect URI to match what's in your Auth0 dashboard
    redirect_uri: `${process.env.APP_BASE_URL}/auth/callback`,
  }
});
