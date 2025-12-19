/**
 * Configures browser-side Sentry instrumentation.
 * https://docs.sentry.io/platforms/javascript/guides/react/
 */
import * as Sentry from "@sentry/react";
import { env } from "@/env";

const isDevelopment = import.meta.env.MODE === "development";
const environment =
  import.meta.env.VITE_SENTRY_ENVIRONMENT ??
  import.meta.env.MODE ??
  "development";
const dsn = env.SENTRY_DSN;
// Initialize Sentry in all environments if DSN is provided (enables "Report Bug" in dev)
const shouldInitializeSentry = Boolean(dsn);

const replayOptions = {
  maskAllText: false,
  blockAllMedia: false,
};

const feedbackOptions = {
  colorScheme: "system" as const,
  isNameRequired: false,
  isEmailRequired: false,
};

const ignoredErrors = [
  "top.GLOBALS",
  "chrome-extension://",
  "moz-extension://",
  "NetworkError",
  "Network request failed",
  "AccessTokenError",
];

if (shouldInitializeSentry && dsn) {
  Sentry.init({
    dsn,
    // Use tunnel to bypass ad-blockers, DNS filters, and browser privacy features
    // In dev: Vite proxy forwards /api/* to backend. In prod: use full API URL.
    // Generic name "/t" avoids ad-blocker keyword detection
    tunnel: env.API_URL ? `${env.API_URL}/t` : "/t",
    environment,
    ...(env.APP_VERSION && {
      release: `agent-chat-ui@${env.APP_VERSION}`,
    }),
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(replayOptions),
      Sentry.feedbackIntegration(feedbackOptions),
    ],
    tracesSampleRate: isDevelopment ? 1.0 : 0.2,
    replaysSessionSampleRate: isDevelopment ? 1.0 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
          if (breadcrumb.data?.request?.headers) {
            const headers = { ...breadcrumb.data.request.headers };
            delete headers.authorization;
            delete headers.Authorization;
            breadcrumb.data.request.headers = headers;
          }
          return breadcrumb;
        });
      }

      if (isDevelopment) {
        console.log("[Sentry Event]", event);
      }

      return event;
    },
    ignoreErrors: ignoredErrors,
  });
}
