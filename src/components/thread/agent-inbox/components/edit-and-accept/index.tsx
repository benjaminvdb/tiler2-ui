import React from "react";
import { AcceptComponent } from "../accept-component";
import { useEditResponse } from "./hooks/use-edit-response";
import { useResetHandler } from "./hooks/use-reset-handler";
import { useKeyboardHandler } from "./hooks/use-keyboard-handler";
import { getButtonText, getHeaderText } from "./utils/button-text";
import { Header } from "./components/header";
import { FormField } from "./components/form-field";
import { SubmitButton } from "./components/submit-button";
import { EditAndOrAcceptComponentProps } from "./types";

function EditAndOrAcceptComponent({
  humanResponse,
  streaming,
  initialValues,
  interruptValue,
  onEditChange,
  handleSubmit,
}: EditAndOrAcceptComponentProps) {
  const defaultRows = React.useRef<Record<string, number>>({});
  const { editResponse, acceptResponse, isValidEditResponse } = useEditResponse(humanResponse);
  const { handleReset } = useResetHandler(editResponse, initialValues, onEditChange);
  const { handleKeyDown } = useKeyboardHandler(handleSubmit);
  
  if (!isValidEditResponse || !editResponse) {
    if (acceptResponse) {
      return (
        <AcceptComponent
          actionRequestArgs={interruptValue.action_request.args}
          streaming={streaming}
          handleSubmit={handleSubmit}
        />
      );
    }
    return null;
  }
  
  const headerText = getHeaderText(editResponse);
  const buttonText = getButtonText(editResponse);

  return (
    <div className="flex w-full flex-col items-start gap-4 rounded-lg border-[1px] border-gray-300 p-6">
      <Header title={headerText} onReset={handleReset} />

      {editResponse.args && typeof editResponse.args === "object" && (editResponse.args as any).args && Object.entries((editResponse.args as any).args).map(([k, v], idx) => (
        <FormField
          key={`allow-edit-args--${k}-${idx}`}
          fieldKey={k}
          value={v}
          editResponse={editResponse}
          streaming={streaming}
          defaultRows={defaultRows}
          onEditChange={onEditChange}
          onKeyDown={handleKeyDown}
          index={idx}
        />
      ))}

      <SubmitButton
        buttonText={buttonText}
        streaming={streaming}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export { EditAndOrAcceptComponent };