/**
 * Custom HttpAgent that extracts auth token from forwardedProps and adds to headers.
 *
 * This agent is used with CopilotKit's runtime to forward authentication tokens
 * from the frontend to the backend agent endpoint.
 *
 * Verified from @ag-ui/client source:
 * - HttpAgent from @ag-ui/client (ag-ui/sdks/typescript/packages/client/src/agent/http.ts:14-76)
 * - requestInit can be overridden (lines 25-36)
 * - RunAgentInput is re-exported from @ag-ui/client (client/src/index.ts:9)
 * - forwardedProps contains frontend <CopilotKit properties={...} /> values
 */

import { HttpAgent } from "@ag-ui/client";
import type { RunAgentInput } from "@ag-ui/client";

export class AuthHttpAgent extends HttpAgent {
  protected requestInit(input: RunAgentInput): RequestInit {
    // Extract auth token from forwardedProps (passed from frontend <CopilotKit properties={...} />)
    const token = (input.forwardedProps as Record<string, unknown>)
      ?.authorization as string | undefined;

    return {
      method: "POST",
      headers: {
        ...this.headers,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(input),
      signal: this.abortController.signal,
    };
  }
}
