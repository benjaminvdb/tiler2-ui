import React from "react";
import { MessageSquare } from "lucide-react";

export const ThreadEmptyState = (): React.JSX.Element => {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--sand)]">
          <MessageSquare
            className="h-8 w-8 text-[var(--muted-foreground)]"
            aria-hidden="true"
          />
        </div>

        <h2 className="mb-3 text-xl font-medium text-[var(--foreground)]">
          No saved messages
        </h2>

        <p className="text-[var(--muted-foreground)]">
          This conversation does not have any persisted messages yet. You can
          continue the conversation by sending a new message below.
        </p>
      </div>
    </div>
  );
};
