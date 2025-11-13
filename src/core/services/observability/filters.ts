/**
 * Sensitive data filtering for observability events
 * Applied before sending to Sentry to prevent exposure of sensitive data
 */

const SENSITIVE_KEYS = [
  "password",
  "token",
  "secret",
  "apikey",
  "api_key",
  "authorization",
  "auth",
  "cookie",
  "session",
  "jwt",
  "bearer",
  "access_token",
  "refresh_token",
  "private_key",
  "client_secret",
];

const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/gi;
const LONG_TOKEN_PATTERN = /\b[A-Za-z0-9]{32,}\b/g;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

const SENSITIVE_PATTERNS = [
  EMAIL_PATTERN,
  BEARER_PATTERN,
  LONG_TOKEN_PATTERN,
  JWT_PATTERN,
];

/**
 * Redact sensitive data from an object
 * Returns a new object with sensitive fields replaced with [REDACTED]
 */
export function redactSensitiveData(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    return typeof obj === "string" ? redactSensitiveString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();

    if (SENSITIVE_KEYS.some((sk) => keyLower.includes(sk))) {
      result[key] = "[REDACTED]";
      continue;
    }

    if (typeof value === "string") {
      result[key] = redactSensitiveString(value);
    } else if (typeof value === "object" && value !== null) {
      result[key] = redactSensitiveData(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Redact sensitive patterns from a string
 */
function redactSensitiveString(str: string): string {
  let result = str;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]");
  }
  return result;
}

/**
 * Check if a value contains sensitive data
 */
export function containsSensitiveData(value: unknown): boolean {
  if (typeof value === "string") {
    return SENSITIVE_PATTERNS.some((pattern) => pattern.test(value));
  }
  if (typeof value === "object" && value !== null) {
    const keys = Object.keys(value);
    return keys.some((key) =>
      SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk)),
    );
  }
  return false;
}
