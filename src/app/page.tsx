"use client";

import React from "react";
import { Thread } from "@/features/thread/components";
import { StreamProvider } from "@/core/providers/stream";
import { ArtifactProvider } from "@/features/artifacts/components";
import { SidePanel } from "@/features/side-panel";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { AppProviders } from "./app-providers";

function ThreadsContent(): React.ReactNode {
  return (
    <StreamProvider>
      <ArtifactProvider>
        <div className="flex h-screen w-full overflow-hidden">
          <SidePanel />
          <Thread />
        </div>
      </ArtifactProvider>
    </StreamProvider>
  );
}

export default function ThreadsPage(): React.ReactNode {
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
        <AppProviders>
          <ThreadsContent />
        </AppProviders>
      </React.Suspense>
    </ErrorBoundary>
  );
}
