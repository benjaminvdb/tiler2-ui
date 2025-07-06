/**
 * Server-side configuration
 * Contains sensitive environment variables that should only be accessed on the server
 */

export interface ServerConfig {
  langgraphApiUrl: string;
  langsmithApiKey: string;
}

/**
 * Get server-side configuration
 * This function should only be called from server-side code (API routes, middleware, etc.)
 */
export function getServerConfig(): ServerConfig {
  const langgraphApiUrl = process.env.LANGGRAPH_API_URL;
  const langsmithApiKey = process.env.LANGSMITH_API_KEY;

  if (!langgraphApiUrl) {
    throw new Error("Missing required environment variable: LANGGRAPH_API_URL");
  }
  
  if (!langsmithApiKey) {
    throw new Error("Missing required environment variable: LANGSMITH_API_KEY");
  }

  return {
    langgraphApiUrl,
    langsmithApiKey,
  };
}