import React from "react";
import { ConfigurationFormContent } from "./configuration-form/components/configuration-form-content";
import { ConfigurationFormProps } from "./types";

export const ConfigurationForm: React.FC<ConfigurationFormProps> = (props) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <ConfigurationFormContent {...props} />
    </div>
  );
};
