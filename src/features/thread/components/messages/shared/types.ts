export interface ContentCopyableProps {
  content: string;
  disabled: boolean;
}

export interface BranchSwitcherProps {
  branch: string | undefined;
  branchOptions: string[] | undefined;
  onSelect: (branch: string) => void;
  isLoading: boolean;
}

export interface CommandBarProps {
  content: string;
  htmlContainerRef?: React.RefObject<HTMLDivElement | null>;
  isHumanMessage?: boolean;
  isAiMessage?: boolean;
  isEditing?: boolean;
  setIsEditing?: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmitEdit?: () => void;
  handleRegenerate?: () => void;
  isLoading: boolean;
  threadId?: string | null;
  runId?: string | null;
  onExpertHelpClick?: () => void;
}
