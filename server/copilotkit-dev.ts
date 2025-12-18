/**
 * Local development server for CopilotKit runtime.
 *
 * Run with: pnpm dev:copilotkit
 *
 * Features:
 * - Auto-reload on file changes (via tsx watch)
 * - Auto-reload on .env/.env.local changes
 * - Graceful shutdown on SIGTERM/SIGINT
 * - Health check endpoint at /health
 */

import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import {
  CopilotRuntime,
  EmptyAdapter,
  copilotRuntimeNodeExpressEndpoint,
} from "@copilotkit/runtime";
import { AuthHttpAgent } from "./auth-http-agent";

dotenv.config({ path: [".env.local", ".env"] });

const PORT = Number(process.env.COPILOTKIT_PORT) || 4000;
const API_URL = process.env.VITE_API_URL || process.env.API_URL;
const BACKEND_URL = API_URL || "http://localhost:2024";

interface ServerState {
  isShuttingDown: boolean;
}

const state: ServerState = { isShuttingDown: false };

function validateConfig(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (!API_URL) {
    warnings.push(
      "No API_URL or VITE_API_URL set. Using default: http://localhost:2024",
    );
  }

  return { valid: true, warnings };
}

function shutdownMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (state.isShuttingDown) {
    res.set("Connection", "close");
    res.status(503).json({ error: "Server is shutting down" });
    return;
  }
  next();
}

function createApp() {
  const app = express();

  app.use(shutdownMiddleware);
  app.use(cors({ origin: true, credentials: true }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      backend: `${BACKEND_URL}/agent/run`,
      shutdownPending: state.isShuttingDown,
    });
  });

  const runtime = new CopilotRuntime({
    agents: {
      default: new AuthHttpAgent({ url: `${BACKEND_URL}/agent/run` }),
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

  return app;
}

function printStartupBanner(warnings: string[]): void {
  console.log("");
  console.log("╭─────────────────────────────────────────────╮");
  console.log("│         CopilotKit Dev Server               │");
  console.log("╰─────────────────────────────────────────────╯");
  console.log("");
  console.log(`  → Runtime:  http://localhost:${PORT}/copilotkit`);
  console.log(`  → Health:   http://localhost:${PORT}/health`);
  console.log(`  → Backend:  ${BACKEND_URL}/agent/run`);
  console.log("");

  if (warnings.length > 0) {
    console.log("  ⚠ Warnings:");
    warnings.forEach((w) => console.log(`    ${w}`));
    console.log("");
  }

  console.log("  Watching for changes... (Ctrl+C to stop)");
  console.log("");
}

function startServer() {
  const { warnings } = validateConfig();
  const app = createApp();

  const server = app.listen(PORT, () => {
    printStartupBanner(warnings);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n  ✗ Port ${PORT} is already in use\n`);
      console.error(`  Try: COPILOTKIT_PORT=4001 pnpm dev:copilotkit\n`);
    } else {
      console.error("\n  ✗ Server error:", err.message, "\n");
    }
    process.exit(1);
  });

  async function shutdown(signal: string): Promise<void> {
    if (state.isShuttingDown) return;
    state.isShuttingDown = true;

    console.log(`\n  ${signal} received, shutting down...`);

    server.close(() => {
      console.log("  Server closed\n");
      process.exit(0);
    });

    // Force exit after 5s if graceful shutdown hangs
    setTimeout(() => {
      console.log("  Forced shutdown after timeout\n");
      process.exit(1);
    }, 5000).unref();
  }

  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));
}

startServer();
