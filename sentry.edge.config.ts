// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";

Sentry.init({
  // Disable Sentry in development - console logs are sufficient
  enabled: !isDevelopment,

  dsn:
    process.env.SENTRY_DSN ||
    "https://69e051b0a0690b7b1c826f3b6dcce4a5@o4510232763170816.ingest.de.sentry.io/4510243735928912",

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
  ignoreErrors: ["AccessTokenError", "UnauthorizedError"],
});
