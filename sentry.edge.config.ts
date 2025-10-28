// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";
const dsn = process.env.SENTRY_DSN;

// Only initialize Sentry in production when DSN is explicitly configured
// This prevents development data from polluting production Sentry logs
if (!isDevelopment && dsn) {
  Sentry.init({
    dsn,

    // Environment configuration
    environment:
      process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",

    // Performance monitoring - different rates for dev vs production
    // Development: 100% for complete visibility
    // Production: 30% for middleware (higher than server to track auth issues)
    tracesSampleRate: isDevelopment ? 1.0 : 0.3,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Privacy: Disable sendDefaultPii
    sendDefaultPii: false,

    // Data sanitization hook
    beforeSend(event) {
      // Remove sensitive request data
      if (event.request?.headers) {
        const headers = { ...event.request.headers };
        delete headers.authorization;
        delete headers.Authorization;
        delete headers.cookie;
        delete headers.Cookie;
        event.request.headers = headers;
      }

      // In development, log all events to console
      if (isDevelopment) {
        console.log("[Sentry Edge Event]", event);
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // AccessTokenError (401) - handled by automatic redirect to login
      "AccessTokenError",
      // NOTE: UnauthorizedError removed - we want to track 403 Forbidden errors
      // ForbiddenError (403) - NOT ignored, these are important security events
    ],
  });
}
