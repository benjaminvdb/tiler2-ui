/**
 * JWT token utilities for checking expiration and decoding
 */

import { DEFAULT_LATENCY_BUFFER_SECONDS } from "../config/token-config";

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

/**
 * Decode a JWT token without verification (client-side only)
 * WARNING: This does NOT verify the signature - only use for reading claims
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Check if a JWT token is expired or will expire soon
 * @param token - The JWT token to check
 * @param bufferSeconds - Time in seconds before expiry to consider token as "expiring soon" (default: 60s for latency mitigation)
 * @returns Object with expiry information
 */
export function checkTokenExpiry(
  token: string,
  bufferSeconds: number = DEFAULT_LATENCY_BUFFER_SECONDS,
): {
  isExpired: boolean;
  isExpiringSoon: boolean;
  expiresAt: Date | null;
  secondsUntilExpiry: number | null;
} {
  const payload = decodeJwt(token);

  if (!payload || !payload.exp) {
    return {
      isExpired: true,
      isExpiringSoon: true,
      expiresAt: null,
      secondsUntilExpiry: null,
    };
  }

  const expiresAt = new Date(payload.exp * 1000);
  const now = Date.now();
  const secondsUntilExpiry = Math.floor((expiresAt.getTime() - now) / 1000);

  return {
    isExpired: secondsUntilExpiry <= 0,
    isExpiringSoon: secondsUntilExpiry <= bufferSeconds,
    expiresAt,
    secondsUntilExpiry,
  };
}

/**
 * Get token information for debugging
 */
export function getTokenInfo(token: string): {
  payload: JwtPayload | null;
  isExpired: boolean;
  expiresAt: Date | null;
  issuedAt: Date | null;
} {
  const payload = decodeJwt(token);

  if (!payload) {
    return {
      payload: null,
      isExpired: true,
      expiresAt: null,
      issuedAt: null,
    };
  }

  const expiry = checkTokenExpiry(token);

  return {
    payload,
    isExpired: expiry.isExpired,
    expiresAt: expiry.expiresAt,
    issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
  };
}
