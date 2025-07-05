import { HumanInterrupt } from "@langchain/langgraph/prebuilt";

export interface ThreadActionsViewProps {
  interrupt: HumanInterrupt;
  handleShowSidePanel: (showState: boolean, showDescription: boolean) => void;
  showState: boolean;
  showDescription: boolean;
}

export interface ButtonGroupProps {
  handleShowState: () => void;
  handleShowDescription: () => void;
  showingState: boolean;
  showingDescription: boolean;
}

export interface HeaderSectionProps {
  threadTitle: string;
  threadId: string | null;
  apiUrl: string | null;
  onOpenInStudio: () => void;
  onShowState: () => void;
  onShowDescription: () => void;
  showingState: boolean;
  showingDescription: boolean;
}

export interface ActionButtonsProps {
  onResolve: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  onIgnore: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
  ignoreAllowed: boolean;
  actionsDisabled: boolean;
}
