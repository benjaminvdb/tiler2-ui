import { initApiPassthrough } from "langgraph-nextjs-api-passthrough";
import { auth0 } from "@/lib/auth0";
// This file acts as a proxy for requests to your LangGraph server.
// Read the [Going to Production](https://github.com/langchain-ai/agent-chat-ui?tab=readme-ov-file#going-to-production) section for more information.

export const { GET, POST, PUT, PATCH, DELETE, OPTIONS, runtime } =
  initApiPassthrough({
    apiUrl: process.env.LANGGRAPH_API_URL ?? "remove-me", // default, if not defined it will attempt to read process.env.LANGGRAPH_API_URL
    apiKey: process.env.LANGSMITH_API_KEY ?? "remove-me", // default, if not defined it will attempt to read process.env.LANGSMITH_API_KEY
    runtime: "edge", // default
    headers: async (_req) => {
      try {
        const accessToken = await auth0.getAccessToken();
        return {
          Authorization: `Bearer ${accessToken.token}`,
        };
      } catch (error) {
        // If token is expired or invalid, this will be caught by the middleware
        // and user will be redirected to login. For API routes, we can throw
        // the error to let the client handle it appropriately.
        console.warn("Failed to get access token in API route:", error);
        throw error;
      }
    },
    disableWarningLog: true,
  });
