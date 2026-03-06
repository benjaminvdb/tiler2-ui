/**
 * URL validation helpers for untrusted, externally controlled links.
 * Enforces protocol and optional hostname allowlisting.
 */

export interface ExternalUrlValidationOptions {
  allowHttp?: boolean;
  allowedHosts?: readonly string[];
}

const normalizeHost = (host: string): string => {
  return host.trim().toLowerCase();
};

const isAllowedProtocol = (protocol: string, allowHttp: boolean): boolean => {
  return protocol === "https:" || (allowHttp && protocol === "http:");
};

const isAllowedHost = (hostname: string, allowedHosts: readonly string[]) => {
  if (allowedHosts.length === 0) {
    return true;
  }

  const normalizedHostname = normalizeHost(hostname);
  return allowedHosts.some((host) => {
    const normalizedHost = normalizeHost(host);
    return (
      normalizedHostname === normalizedHost ||
      normalizedHostname.endsWith(`.${normalizedHost}`)
    );
  });
};

/**
 * Validates and normalizes an external URL.
 * Returns null when parsing fails or policy checks are not satisfied.
 */
export const sanitizeExternalUrl = (
  value: unknown,
  options: ExternalUrlValidationOptions = {},
): string | null => {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  try {
    const parsed = new URL(value);
    const allowHttp = options.allowHttp ?? false;
    if (!isAllowedProtocol(parsed.protocol, allowHttp)) {
      return null;
    }

    if (!isAllowedHost(parsed.hostname, options.allowedHosts ?? [])) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
};
