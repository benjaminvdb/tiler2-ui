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
        plugins: ['babel-plugin-react-compiler'],
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
    // Increase chunk size warning limit (similar to Next.js)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunking for better caching
          react: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: [
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-separator",
            "@radix-ui/react-switch",
            "@radix-ui/react-tooltip",
          ],
          markdown: [
            "react-markdown",
            "react-syntax-highlighter",
            "remark-gfm",
            "remark-breaks",
            "remark-math",
            "rehype-katex",
            "rehype-sanitize",
          ],
          langchain: [
            "@langchain/core",
            "@langchain/langgraph",
            "@langchain/langgraph-sdk",
          ],
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
