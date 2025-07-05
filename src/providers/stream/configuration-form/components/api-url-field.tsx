import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_API_URL } from "../utils/constants";

interface ApiUrlFieldProps {
  defaultValue?: string;
}

export const ApiUrlField: React.FC<ApiUrlFieldProps> = ({ defaultValue }) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="apiUrl">
        Deployment URL<span className="text-rose-500">*</span>
      </Label>
      <p className="text-muted-foreground text-sm">
        This is the URL of your LangGraph deployment. Can be a local, or
        production deployment.
      </p>
      <Input
        id="apiUrl"
        name="apiUrl"
        className="bg-background"
        defaultValue={defaultValue || DEFAULT_API_URL}
        required
      />
    </div>
  );
};