/**
 * Error reporting configuration
 * Configure production error monitoring services here
 */

import { env } from "@/env";

export interface ErrorReportingServiceConfig {
  name: string;
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  projectId?: string;
  environment?: string;
}

// Sentry configuration
export const sentryConfig: ErrorReportingServiceConfig = {
  name: "Sentry",
  enabled: Boolean(env.SENTRY_DSN),
  ...(env.SENTRY_DSN ? { endpoint: env.SENTRY_DSN } : {}),
  ...(import.meta.env.MODE ? { environment: import.meta.env.MODE } : {}),
};

// DataDog configuration
export const datadogConfig: ErrorReportingServiceConfig = {
  name: "DataDog",
  enabled: Boolean(env.DATADOG_API_KEY),
  ...(env.DATADOG_API_KEY ? { apiKey: env.DATADOG_API_KEY } : {}),
  ...(import.meta.env.MODE ? { environment: import.meta.env.MODE } : {}),
};

// LogRocket configuration
export const logRocketConfig: ErrorReportingServiceConfig = {
  name: "LogRocket",
  enabled: Boolean(env.LOGROCKET_APP_ID),
  ...(env.LOGROCKET_APP_ID ? { apiKey: env.LOGROCKET_APP_ID } : {}),
  ...(import.meta.env.MODE ? { environment: import.meta.env.MODE } : {}),
};

// Bugsnag configuration
export const bugsnagConfig: ErrorReportingServiceConfig = {
  name: "Bugsnag",
  enabled: Boolean(env.BUGSNAG_API_KEY),
  ...(env.BUGSNAG_API_KEY ? { apiKey: env.BUGSNAG_API_KEY } : {}),
  ...(import.meta.env.MODE ? { environment: import.meta.env.MODE } : {}),
};

// Custom webhook configuration
export const customWebhookConfig: ErrorReportingServiceConfig = {
  name: "Custom Webhook",
  enabled: Boolean(env.ERROR_WEBHOOK_URL),
  ...(env.ERROR_WEBHOOK_URL ? { endpoint: env.ERROR_WEBHOOK_URL } : {}),
  ...(env.ERROR_WEBHOOK_API_KEY ? { apiKey: env.ERROR_WEBHOOK_API_KEY } : {}),
  ...(import.meta.env.MODE ? { environment: import.meta.env.MODE } : {}),
};

// Get all enabled services
export const getEnabledServices = (): ErrorReportingServiceConfig[] => {
  return [
    sentryConfig,
    datadogConfig,
    logRocketConfig,
    bugsnagConfig,
    customWebhookConfig,
  ].filter((service) => service.enabled);
};

// Production error reporting configuration
export const productionConfig = {
  enableConsoleLogging: Boolean(env.ENABLE_CONSOLE_LOGGING),
  enableUserNotification: true,
  enableRemoteLogging: getEnabledServices().length > 0,
  enablePerformanceTracking: Boolean(env.ENABLE_PERFORMANCE_TRACKING),
  maxErrorsPerSession: Number(env.MAX_ERRORS_PER_SESSION) || 100,
  enableErrorDevPanel: import.meta.env.MODE === "development",
};

// Example environment variables for .env file
export const exampleEnvVars = `
# Error Reporting Configuration
# Enable console logging in production (optional)
ENABLE_CONSOLE_LOGGING=false

# Enable performance tracking (optional)
ENABLE_PERFORMANCE_TRACKING=true

# Maximum errors per session (optional)
MAX_ERRORS_PER_SESSION=100

# Sentry (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# DataDog (optional)
DATADOG_API_KEY=your-datadog-api-key

# LogRocket (optional)
LOGROCKET_APP_ID=your-logrocket-app-id

# Bugsnag (optional)
BUGSNAG_API_KEY=your-bugsnag-api-key

# Custom webhook (optional)
ERROR_WEBHOOK_URL=https://your-custom-webhook.com/errors
ERROR_WEBHOOK_API_KEY=your-webhook-api-key
`;

// Validate error reporting configuration
export const validateErrorReportingConfig = (): {
  isValid: boolean;
  warnings: string[];
  enabledServices: string[];
} => {
  const warnings: string[] = [];
  const enabledServices = getEnabledServices();

  if (import.meta.env.MODE === "production" && enabledServices.length === 0) {
    warnings.push("No error reporting services configured for production");
  }

  if (enabledServices.length > 3) {
    warnings.push(
      "Multiple error reporting services enabled - may cause performance issues",
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    enabledServices: enabledServices.map((s) => s.name),
  };
};
