import { initApiPassthrough } from "langgraph-nextjs-api-passthrough";
import { getAuth0, isAuth0Configured } from "@/features/auth/services/auth0";
import { getServerConfig } from "@/core/config/server";
import { reportAuthError } from "@/core/services/error-reporting";
// This file acts as a proxy for requests to your LangGraph server.
// Read the [Going to Production](https://github.com/langchain-ai/agent-chat-ui?tab=readme-ov-file#going-to-production) section for more information.

// Get validated server configuration
const { langgraphApiUrl, langsmithApiKey } = getServerConfig();

export const { GET, POST, PUT, PATCH, DELETE, OPTIONS, runtime } =
  initApiPassthrough({
    apiUrl: langgraphApiUrl,
    apiKey: langsmithApiKey,
    runtime: "edge", // default
    headers: async (_req) => {
      if (!isAuth0Configured()) {
        console.warn("Auth0 not configured, proceeding without authentication");
        return {};
      }

      const auth0Client = getAuth0();
      if (!auth0Client) {
        console.warn(
          "Auth0 client not available, proceeding without authentication",
        );
        return {};
      }

      try {
        const accessToken = await auth0Client.getAccessToken();
        return {
          Authorization: `Bearer ${accessToken.token}`,
        };
      } catch (error) {
        if (error instanceof Error && error.name === "AccessTokenError") {
          reportAuthError(error, {
            operation: "getAccessToken",
            component: "API route",
            additionalData: { errorType: "AccessTokenError" },
          });
          throw new Response("Unauthorized", { status: 401 });
        }

        throw error;
      }
    },
    disableWarningLog: true,
  });
