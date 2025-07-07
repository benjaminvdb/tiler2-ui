import React from "react";
import { InstructionTextProps } from "../types";

export const InstructionText: React.FC<InstructionTextProps> = ({
  config,
  hasArgs,
}) => {
  return (
    <div className="ml-7 text-xs text-blue-600">
      {config.allow_edit ? (
        <>
          You can click <strong>Edit</strong> above, or simply type your
          response in the chat input below.
          {config.allow_edit && hasArgs && (
            <> For editing, provide the modified values in your response.</>
          )}
          ;
        </>
      ) : (
        "Type your response in the chat input below or use the buttons above."
      )}
    </div>
  );
};
