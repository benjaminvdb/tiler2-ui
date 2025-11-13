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
const shouldInitializeSentry = !isDevelopment && Boolean(dsn);

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
    environment,
    integrations: [
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
