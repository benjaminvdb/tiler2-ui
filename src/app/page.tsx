import React from "react";
import { ArtifactProvider } from "@/features/artifacts/components";
import { AssistantThread } from "@/features/assistant-ui/thread";

const Page = (): React.ReactNode => {
  return (
    <ArtifactProvider>
      <AssistantThread />
    </ArtifactProvider>
  );
};

export default Page;
