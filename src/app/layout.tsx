import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import React from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Auth0Provider } from "@auth0/nextjs-auth0";

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
        <Auth0Provider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </Auth0Provider>
      </body>
    </html>
  );
}
