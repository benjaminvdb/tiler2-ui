"use client";

import React from "react";

import { Thread } from "@/features/thread/components";
import { StreamProvider } from "@/core/providers/stream";
import { ThreadProvider } from "@/features/thread/providers/thread-provider";
import { ArtifactProvider } from "@/features/artifacts/components";
import { Toaster } from "@/shared";
import { ErrorBoundary } from "@/shared/components/error-boundary";

export default function DemoPage(): React.ReactNode {
  return (
    <ErrorBoundary>
      <React.Suspense
        fallback={
          <div className="bg-background flex h-screen w-full items-center justify-center">
            <div className="text-center">
              <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            </div>
          </div>
        }
      >
        <Toaster />
        <ThreadProvider>
          <StreamProvider>
            <ArtifactProvider>
              <Thread />
            </ArtifactProvider>
          </StreamProvider>
        </ThreadProvider>
      </React.Suspense>
    </ErrorBoundary>
  );
}
