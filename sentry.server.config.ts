// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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
    // Production: 20% to reduce data volume
    tracesSampleRate: isDevelopment ? 1.0 : 0.2,

    // Pino integration for structured logging
    integrations: [
      Sentry.pinoIntegration({
        // Capture info/warn/error as Sentry logs
        log: {
          levels: ["info", "warn", "error"],
        },
        // Capture error/fatal as Sentry error events
        error: {
          levels: ["error", "fatal"],
          handled: true, // Mark as handled (true is default)
        },
      }),
    ],

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Privacy: Disable sendDefaultPii to avoid sending sensitive user data
    // Enable in production only if you need user IPs for debugging
    sendDefaultPii: false,

    // Data sanitization hook
    beforeSend(event) {
      // Remove sensitive environment variables
      if (event.contexts?.runtime?.env) {
        const env = {
          ...(event.contexts.runtime.env as Record<string, unknown>),
        };
        // Remove sensitive keys
        delete env["AUTH0_SECRET"];
        delete env["AUTH0_CLIENT_SECRET"];
        delete env["LANGSMITH_API_KEY"];
        delete env["SENTRY_AUTH_TOKEN"];
        event.contexts.runtime.env = env;
      }

      // Remove sensitive request data
      if (event.request) {
        // Remove authorization headers
        if (event.request.headers) {
          const headers = { ...event.request.headers };
          delete headers.authorization;
          delete headers.Authorization;
          delete headers.cookie;
          delete headers.Cookie;
          event.request.headers = headers;
        }
      }

      // In development, log all events to console
      if (isDevelopment) {
        console.log("[Sentry Server Event]", event);
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
