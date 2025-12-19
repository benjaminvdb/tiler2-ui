/**
 * CopilotKit runtime endpoint for Vercel serverless function.
 *
 * This endpoint proxies AG-UI requests to the backend agent with authentication.
 *
 * Verified from CopilotKit source:
 * - CopilotRuntime accepts agents: Record<string, AbstractAgent> (copilot-runtime.ts:178)
 * - AbstractAgent is from @ag-ui/client (copilot-runtime.ts:50)
 * - copilotRuntimeNodeHttpEndpoint (node-http/index.ts:97)
 * - ExperimentalEmptyAdapter (empty/empty-adapter.ts:38)
 */

import {
  CopilotRuntime,
  EmptyAdapter,
  copilotRuntimeNodeHttpEndpoint,
} from "@copilotkit/runtime";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AuthHttpAgent } from "../server/auth-http-agent";

// Get backend URL from environment (supports both VITE_ and non-prefixed versions)
const apiUrl = process.env.VITE_API_URL || process.env.API_URL;

if (!apiUrl) {
  console.error("Missing API_URL or VITE_API_URL environment variable");
}

const runtime = new CopilotRuntime({
  agents: {
    default: new AuthHttpAgent({
      url: `${apiUrl}/agent/run`,
    }),
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return copilotRuntimeNodeHttpEndpoint({
    endpoint: "/api/copilotkit",
    runtime,
    serviceAdapter: new EmptyAdapter(),
  })(req as unknown as Request, res as unknown as Response);
}
