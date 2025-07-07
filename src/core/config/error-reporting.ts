/**
 * Error reporting configuration
 * Configure production error monitoring services here
 */

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
  enabled: Boolean(process.env.SENTRY_DSN),
  ...(process.env.SENTRY_DSN ? { endpoint: process.env.SENTRY_DSN } : {}),
  ...(process.env.NODE_ENV ? { environment: process.env.NODE_ENV } : {}),
};

// DataDog configuration
export const datadogConfig: ErrorReportingServiceConfig = {
  name: "DataDog",
  enabled: Boolean(process.env.DATADOG_API_KEY),
  ...(process.env.DATADOG_API_KEY
    ? { apiKey: process.env.DATADOG_API_KEY }
    : {}),
  ...(process.env.NODE_ENV ? { environment: process.env.NODE_ENV } : {}),
};

// LogRocket configuration
export const logRocketConfig: ErrorReportingServiceConfig = {
  name: "LogRocket",
  enabled: Boolean(process.env.LOGROCKET_APP_ID),
  ...(process.env.LOGROCKET_APP_ID
    ? { apiKey: process.env.LOGROCKET_APP_ID }
    : {}),
  ...(process.env.NODE_ENV ? { environment: process.env.NODE_ENV } : {}),
};

// Bugsnag configuration
export const bugsnagConfig: ErrorReportingServiceConfig = {
  name: "Bugsnag",
  enabled: Boolean(process.env.BUGSNAG_API_KEY),
  ...(process.env.BUGSNAG_API_KEY
    ? { apiKey: process.env.BUGSNAG_API_KEY }
    : {}),
  ...(process.env.NODE_ENV ? { environment: process.env.NODE_ENV } : {}),
};

// Custom webhook configuration
export const customWebhookConfig: ErrorReportingServiceConfig = {
  name: "Custom Webhook",
  enabled: Boolean(process.env.ERROR_WEBHOOK_URL),
  ...(process.env.ERROR_WEBHOOK_URL
    ? { endpoint: process.env.ERROR_WEBHOOK_URL }
    : {}),
  ...(process.env.ERROR_WEBHOOK_API_KEY
    ? { apiKey: process.env.ERROR_WEBHOOK_API_KEY }
    : {}),
  ...(process.env.NODE_ENV ? { environment: process.env.NODE_ENV } : {}),
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
  enableConsoleLogging: Boolean(process.env.ENABLE_CONSOLE_LOGGING),
  enableUserNotification: true,
  enableRemoteLogging: getEnabledServices().length > 0,
  enablePerformanceTracking: Boolean(process.env.ENABLE_PERFORMANCE_TRACKING),
  maxErrorsPerSession: Number(process.env.MAX_ERRORS_PER_SESSION) || 100,
  enableErrorDevPanel: process.env.NODE_ENV === "development",
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

  if (process.env.NODE_ENV === "production" && enabledServices.length === 0) {
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
