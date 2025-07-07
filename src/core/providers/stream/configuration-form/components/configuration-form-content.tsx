import React from "react";
import { FormHeader } from "./form-header";
import { ApiUrlField } from "./api-url-field";
import { AssistantIdField } from "./assistant-id-field";
import { SubmitButton } from "./submit-button";
import { handleFormSubmission } from "../utils/form-handler";
import { ConfigurationFormProps } from "../../types";

export const ConfigurationFormContent: React.FC<ConfigurationFormProps> = ({
  apiUrl,
  assistantId,
  onSubmit,
}) => {
  return (
    <div className="animate-in fade-in-0 zoom-in-95 bg-background flex max-w-3xl flex-col rounded-lg border shadow-lg">
      <FormHeader />
      <form
        onSubmit={(e) => handleFormSubmission(e, onSubmit)}
        className="bg-muted/50 flex flex-col gap-6 p-6"
      >
        <ApiUrlField defaultValue={apiUrl} />
        <AssistantIdField defaultValue={assistantId} />
        <SubmitButton />
      </form>
    </div>
  );
};
