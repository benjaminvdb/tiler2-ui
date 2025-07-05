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

export function ChatInterrupt({
  interrupt,
  onAccept,
  onRespond,
  onEdit,
  onIgnore,
}: ChatInterruptProps) {
  const { action_request, config } = interrupt;
  const questionText = getQuestionText(interrupt);
  const hasArgs = hasActionArgs(action_request);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      <InterruptHeader questionText={questionText} />

      {/* Commented out sections can be enabled by uncommenting below */}
      {/* <ActionDetails actionRequest={action_request} hasArgs={hasArgs} /> */}
      {/* <ActionButtons 
        config={config} 
        onAccept={onAccept} 
        onEdit={onEdit} 
        onIgnore={onIgnore} 
      /> */}
      {/* <InstructionText config={config} hasArgs={hasArgs} /> */}
    </div>
  );
}
