/**
 * Sensitive data filtering for logs
 * Applied on client-side before sending to Sentry
 * Server-side uses Pino's built-in redaction
 */

// Keys that indicate sensitive data
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

// Patterns that indicate sensitive data in strings
const SENSITIVE_PATTERNS = [
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  // Bearer tokens
  /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/gi,
  // Long alphanumeric tokens (32+ chars)
  /\b[A-Za-z0-9]{32,}\b/g,
  // JWT tokens (3 base64 segments)
  /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
];

/**
 * Redact sensitive data from an object
 * Returns a new object with sensitive fields replaced with [REDACTED]
 */
export function redactSensitiveData(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    // For primitive strings, check patterns
    if (typeof obj === "string") {
      return redactSensitiveString(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();

    // Check if key name indicates sensitive data
    if (SENSITIVE_KEYS.some((sk) => keyLower.includes(sk))) {
      result[key] = "[REDACTED]";
      continue;
    }

    // Recursively process the value
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
