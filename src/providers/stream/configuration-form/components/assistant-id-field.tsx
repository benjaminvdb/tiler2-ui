import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_ASSISTANT_ID } from "../utils/constants";

interface AssistantIdFieldProps {
  defaultValue?: string;
}

export const AssistantIdField: React.FC<AssistantIdFieldProps> = ({
  defaultValue,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="assistantId">
        Assistant / Graph ID<span className="text-rose-500">*</span>
      </Label>
      <p className="text-muted-foreground text-sm">
        This is the ID of the graph (can be the graph name), or assistant to
        fetch threads from, and invoke when actions are taken.
      </p>
      <Input
        id="assistantId"
        name="assistantId"
        className="bg-background"
        defaultValue={defaultValue || DEFAULT_ASSISTANT_ID}
        required
      />
    </div>
  );
};
