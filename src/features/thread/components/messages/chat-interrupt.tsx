import React from "react";
import { ChatInterruptProps } from "./chat-interrupt/types";
import {
  getQuestionText,
  hasActionArgs,
} from "./chat-interrupt/utils/interrupt-helpers";
import { InterruptHeader } from "./chat-interrupt/components/interrupt-header";
import { ActionDetails } from "./chat-interrupt/components/action-details";
import { ActionButtons } from "./chat-interrupt/components/action-buttons";
import { InstructionText } from "./chat-interrupt/components/instruction-text";

export const ChatInterrupt: React.FC<ChatInterruptProps> = ({
  interrupt,
  onAccept: _onAccept,
  onRespond: _onRespond,
  onEdit: _onEdit,
  onIgnore: _onIgnore,
}) => {
  const questionText = getQuestionText(interrupt);
  const hasArgs = hasActionArgs(interrupt.action_request);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      <InterruptHeader questionText={questionText} />
      <ActionDetails
        actionRequest={interrupt.action_request}
        hasArgs={hasArgs}
      />
      <ActionButtons
        config={interrupt.config}
        {...(_onAccept && { onAccept: _onAccept })}
        {...(_onEdit && { onEdit: _onEdit })}
        {...(_onIgnore && { onIgnore: _onIgnore })}
      />
      <InstructionText
        config={interrupt.config}
        hasArgs={hasArgs}
      />
    </div>
  );
};
