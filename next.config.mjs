import bundleAnalyzer from "@next/bundle-analyzer";
import { fileURLToPath } from "node:url";
import createJiti from "jiti";

// Validate environment variables at build time
// Using jiti to import TypeScript env.ts file
const jiti = createJiti(fileURLToPath(import.meta.url));
jiti("./src/env.ts");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
