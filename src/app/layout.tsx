import type { Metadata } from "next";
import "./globals.css";
import { Inter, Source_Serif_4 } from "next/font/google";
import "@fontsource/comic-mono/400.css";
import "@fontsource/comic-mono/700.css";
import React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Auth0Provider } from "@auth0/nextjs-auth0";
import { MotionConfigProvider } from "@/core/providers/motion-config-provider";
import { GlobalErrorBoundary } from "@/shared/components/error-boundary/global-error-boundary";
import { AsyncErrorBoundary } from "@/shared/components/error-boundary/async-error-boundary";
import { AppLayout } from "./app-layout";
import { getAuth0 } from "@/features/auth/services/auth0";
import { SentryUserContext } from "@/core/providers/sentry-user-context";

const inter = Inter({
  subsets: ["latin"],
  preload: true,
  display: "swap",
  variable: "--font-inter",
});

const sourceSerifPro = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  preload: true,
  display: "swap",
  variable: "--font-source-serif-pro",
});

export const metadata: Metadata = {
  title: "Link Chat",
  description: "Link Chat by Link Nature",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch user session server-side to eliminate client-side loading state
  const auth0 = getAuth0();
  const session = auth0 ? await auth0.getSession() : null;

  // Only pass user prop if it exists to satisfy exactOptionalPropertyTypes
  const auth0ProviderProps = session?.user ? { user: session.user } : {};

  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerifPro.variable}`}
    >
      <body className={inter.className}>
        <MotionConfigProvider>
          <GlobalErrorBoundary>
            <AsyncErrorBoundary>
              <Auth0Provider {...auth0ProviderProps}>
                <SentryUserContext user={session?.user || null} />
                <NuqsAdapter>
                  <AppLayout>{children}</AppLayout>
                </NuqsAdapter>
              </Auth0Provider>
            </AsyncErrorBoundary>
          </GlobalErrorBoundary>
        </MotionConfigProvider>
      </body>
    </html>
  );
}
