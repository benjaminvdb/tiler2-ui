"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy load the Thread component with a loading fallback
const ThreadComponent = dynamic(
  () => import("./index").then((mod) => ({ default: mod.Thread })),
  {
    loading: () => (
      <div className="bg-background flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground text-sm">
            Loading chat interface...
          </p>
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for this component to reduce initial bundle
  },
);

export const Thread = () => {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="text-muted-foreground text-sm">
              Loading chat interface...
            </p>
          </div>
        </div>
      }
    >
      <ThreadComponent />
    </Suspense>
  );
};
