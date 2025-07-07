import React from "react";
import { ChatInterruptProps } from "./chat-interrupt/types";
import { getQuestionText } from "./chat-interrupt/utils/interrupt-helpers";
import { InterruptHeader } from "./chat-interrupt/components/interrupt-header";

export const ChatInterrupt: React.FC<ChatInterruptProps> = ({
  interrupt,
  onAccept: _onAccept,
  onRespond: _onRespond,
  onEdit: _onEdit,
  onIgnore: _onIgnore,
}) => {
  const questionText = getQuestionText(interrupt);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      <InterruptHeader questionText={questionText} />
      {/* Commented out sections can be enabled by uncommenting below */};
      {/* <ActionDetails actionRequest={action_request} hasArgs={hasArgs} /> */}
      ;
      {/* <ActionButtons 
        config={config}
        onAccept={onAccept}
        onEdit={onEdit}
        onIgnore={onIgnore}
      /> */}
      ;{/* <InstructionText config={config} hasArgs={hasArgs} /> */}
    </div>
  );
};
