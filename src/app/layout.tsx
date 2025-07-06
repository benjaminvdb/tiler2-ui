import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { GlobalErrorBoundary } from "@/components/error-boundary/global-error-boundary";
import { AsyncErrorBoundary } from "@/components/error-boundary/async-error-boundary";

const inter = Inter({
  subsets: ["latin"],
  preload: true,
  display: "swap",
});

export const metadata: Metadata = {
  title: "Link Chat",
  description: "Link Chat by Link Nature",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalErrorBoundary>
          <AsyncErrorBoundary>
            <Auth0Provider>
              <NuqsAdapter>{children}</NuqsAdapter>
            </Auth0Provider>
          </AsyncErrorBoundary>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
