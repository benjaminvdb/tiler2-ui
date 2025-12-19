/**
 * Local development server for CopilotKit runtime.
 *
 * Run with: pnpm dev:copilotkit
 *
 * This server provides the CopilotKit runtime endpoint for local development
 * without requiring Vercel.
 *
 * Verified from CopilotKit source:
 * - copilotRuntimeNodeExpressEndpoint (node-express/index.ts:5)
 */

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import {
  CopilotRuntime,
  EmptyAdapter,
  copilotRuntimeNodeExpressEndpoint,
} from "@copilotkit/runtime";
import { AuthHttpAgent } from "./auth-http-agent";

// Load environment variables - .env.local takes priority over .env
// Per dotenv docs: "The first value set for a variable will win"
dotenv.config({ path: [".env.local", ".env"] });

const app = express();
app.use(cors({ origin: true, credentials: true }));

// Get backend URL from environment
const apiUrl = process.env.VITE_API_URL || process.env.API_URL;

if (!apiUrl) {
  console.error(
    "Missing API_URL or VITE_API_URL environment variable. Using default: http://localhost:2024",
  );
}

const backendUrl = apiUrl || "http://localhost:2024";

const runtime = new CopilotRuntime({
  agents: {
    default: new AuthHttpAgent({
      url: `${backendUrl}/agent/run`,
    }),
  },
});

app.use(
  "/copilotkit",
  copilotRuntimeNodeExpressEndpoint({
    endpoint: "/copilotkit",
    runtime,
    serviceAdapter: new EmptyAdapter(),
  }),
);

const PORT = process.env.COPILOTKIT_PORT || 4000;

app.listen(PORT, (error?: Error) => {
  if (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
  console.log(
    `CopilotKit dev server running at http://localhost:${PORT}/copilotkit`,
  );
  console.log(`Backend URL: ${backendUrl}/agent/run`);
  console.log("");
  console.log("Make sure your backend is running on the above URL.");
  console.log("If using .env.local, restart this server after changes.");
});
