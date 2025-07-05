import React from "react";
import { Button } from "@/components/ui/button";
import { ArgsRenderer } from "./shared/args-renderer";

interface AcceptComponentProps {
  streaming: boolean;
  actionRequestArgs: Record<string, any>;
  handleSubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent,
  ) => Promise<void>;
}

export function AcceptComponent({
  streaming,
  actionRequestArgs,
  handleSubmit,
}: AcceptComponentProps) {
  return (
    <div className="flex w-full flex-col items-start gap-4 rounded-lg border-[1px] border-gray-300 p-6">
      {actionRequestArgs && Object.keys(actionRequestArgs).length > 0 && (
        <ArgsRenderer args={actionRequestArgs} />
      )}
      <Button
        variant="brand"
        disabled={streaming}
        onClick={handleSubmit}
        className="w-full"
      >
        Accept
      </Button>
    </div>
  );
}
