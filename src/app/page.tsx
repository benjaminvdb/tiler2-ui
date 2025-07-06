"use client";

import { Thread } from "@/components/thread/thread-lazy";
import { StreamProvider } from "@/providers/stream";
import { ThreadProvider } from "@/providers/thread";
import { ArtifactProvider } from "@/components/thread/artifact";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import React from "react";

export default function DemoPage(): React.ReactNode {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<div>Loading (layout)...</div>}>
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
