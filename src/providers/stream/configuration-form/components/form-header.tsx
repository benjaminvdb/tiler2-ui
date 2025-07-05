import React from "react";
import { LinkLogoSVG } from "@/components/icons/link";

export const FormHeader: React.FC = () => {
  return (
    <div className="mt-14 flex flex-col gap-2 border-b p-6">
      <div className="flex flex-col items-start gap-2">
        <LinkLogoSVG className="h-7" />
        <h1 className="text-xl font-semibold tracking-tight">
          Link Chat
        </h1>
      </div>
      <p className="text-muted-foreground">
        Welcome to Link Chat! Before you get started, you need to enter
        the URL of the deployment and the assistant / graph ID.
      </p>
    </div>
  );
};