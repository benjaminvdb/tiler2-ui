"use client";

import React from "react";

const Thread = React.lazy(() =>
  import("@/features/thread/components/thread-lazy").then((m) => ({
    default: m.Thread,
  })),
);
import { StreamProvider } from "@/core/providers/stream";
import { ThreadProvider } from "@/features/thread/providers/thread-provider";
import { ArtifactProvider } from "@/features/artifacts/components";
import { Toaster } from "@/shared";
import { ErrorBoundary } from "@/shared/components/error-boundary";

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
