/**
 * Thread error utilities
 */

/**
 * Determines if an error is a "not found" error (404)
 */
export const isThreadNotFoundError = (error: Error | null): boolean => {
  if (!error) return false;

  const message = error.message.toLowerCase();

  // Check for HTTP 404 status in error message
  if (message.includes("http 404") || message.includes("404")) {
    return true;
  }

  // Check for "not found" text
  if (message.includes("not found") || message.includes("not_found")) {
    return true;
  }

  // Check for status property on HTTP errors
  if ("status" in error && (error as { status: number }).status === 404) {
    return true;
  }

  return false;
};
