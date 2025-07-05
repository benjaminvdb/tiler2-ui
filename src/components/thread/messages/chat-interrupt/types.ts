import { HumanInterrupt } from "@langchain/langgraph/prebuilt";

export interface ChatInterruptProps {
  interrupt: HumanInterrupt;
  onAccept?: () => void;
  onRespond?: () => void;
  onEdit?: () => void;
  onIgnore?: () => void;
}

export interface InterruptHeaderProps {
  questionText: string;
}

export interface ActionDetailsProps {
  actionRequest: HumanInterrupt["action_request"];
  hasArgs: boolean;
}

export interface ActionButtonsProps {
  config: HumanInterrupt["config"];
  onAccept?: () => void;
  onEdit?: () => void;
  onIgnore?: () => void;
}

export interface InstructionTextProps {
  config: HumanInterrupt["config"];
  hasArgs: boolean;
}