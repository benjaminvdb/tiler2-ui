import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    // Bundle analyzer (equivalent to @next/bundle-analyzer)
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Sentry plugin for source map upload (must be last)
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: "./dist/**",
        filesToDeleteAfterUpload: ["**/*.js.map"], // Delete source maps after upload for security
      },
      telemetry: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/core": path.resolve(__dirname, "./src/core"),
      "@/infrastructure": path.resolve(__dirname, "./src/infrastructure"),
    },
  },
  server: {
    port: 3000,
    // Proxy API requests to backend if needed
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Enable source map generation for Sentry
    sourcemap: true,
    // Increase chunk size warning limit to accommodate markdown rendering pipeline
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      // Silence expected warnings
      onwarn(warning, warn) {
        // Silence "node:async_hooks" externalization warning from @langchain/langgraph
        if (warning.message && warning.message.includes("node:async_hooks")) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: {
          // Core React
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          // UI components (Radix primitives)
          ui: [
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tooltip",
          ],
          // Markdown rendering pipeline
          markdown: [
            "react-markdown",
            "react-syntax-highlighter",
            "remark-gfm",
            "remark-breaks",
            "remark-math",
            "rehype-katex",
            "rehype-sanitize",
            "katex",
          ],
          // LangChain SDK
          langchain: [
            "@langchain/core",
            "@langchain/langgraph",
            "@langchain/langgraph-sdk",
          ],
          // Data tables
          tanstack: ["@tanstack/react-table"],
          // Error monitoring
          sentry: ["@sentry/react"],
          // Authentication
          auth: ["@auth0/auth0-react"],
          // Animation library
          animation: ["framer-motion"],
          // Icon library
          icons: ["lucide-react"],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@langchain/core",
      "@langchain/langgraph",
      "@langchain/langgraph-sdk",
    ],
  },
});
