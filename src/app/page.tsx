"use client";

import React from "react";
import { Thread } from "@/features/thread/components";
import { StreamProvider } from "@/core/providers/stream";
import { ArtifactProvider } from "@/features/artifacts/components";

export default function ThreadsPage(): React.ReactNode {
  return (
    <StreamProvider>
      <ArtifactProvider>
        <Thread />
      </ArtifactProvider>
    </StreamProvider>
  );
}
