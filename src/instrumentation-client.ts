// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";

Sentry.init({
  dsn:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    "https://69e051b0a0690b7b1c826f3b6dcce4a5@o4510232763170816.ingest.de.sentry.io/4510243735928912",

  // Environment configuration
  environment:
    process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || "development",

  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media for privacy
      maskAllText: false, // Set to true if you want to mask all text
      blockAllMedia: false, // Set to true if you want to block all media
    }),
    // User feedback widget (optional)
    Sentry.feedbackIntegration({
      colorScheme: "system",
      isNameRequired: false,
      isEmailRequired: false,
    }),
  ],

  // Performance monitoring - different rates for dev vs production
  // Development: 100% for complete visibility
  // Production: 20% to reduce data volume
  tracesSampleRate: isDevelopment ? 1.0 : 0.2,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Session Replay sampling
  // Development: 100% for complete visibility
  // Production: 10% to reduce data volume
  replaysSessionSampleRate: isDevelopment ? 1.0 : 0.1,

  // Always capture replays when errors occur
  replaysOnErrorSampleRate: 1.0,

  // Privacy: Disable sendDefaultPii to avoid sending sensitive user data
  // If you need user IPs, enable this in production
  sendDefaultPii: false,

  // Data sanitization hook
  beforeSend(event) {
    // Remove sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        // Remove authorization headers
        if (breadcrumb.data?.request?.headers) {
          const headers = { ...breadcrumb.data.request.headers };
          delete headers.authorization;
          delete headers.Authorization;
          breadcrumb.data.request.headers = headers;
        }
        return breadcrumb;
      });
    }

    // In development, log all events to console
    if (isDevelopment) {
      console.log("[Sentry Event]", event);
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    // Browser extension errors
    "top.GLOBALS",
    "chrome-extension://",
    "moz-extension://",
    // Random network errors
    "NetworkError",
    "Network request failed",
    // Auth0 handled errors
    "AccessTokenError",
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
