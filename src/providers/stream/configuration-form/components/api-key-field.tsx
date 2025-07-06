import React from "react";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

interface ApiKeyFieldProps {
  defaultValue?: string | null;
}

export const ApiKeyField: React.FC<ApiKeyFieldProps> = ({ defaultValue }) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="apiKey">LangSmith API Key</Label>
      <p className="text-muted-foreground text-sm">
        This is <strong>NOT</strong> required if using a local LangGraph server.
        This value is stored in your browser&apos;s local storage and is only
        used to authenticate requests sent to your LangGraph server.
      </p>
      <PasswordInput
        id="apiKey"
        name="apiKey"
        defaultValue={defaultValue ?? ""}
        className="bg-background"
        placeholder="lsv2_pt_..."
      />
    </div>
  );
};
