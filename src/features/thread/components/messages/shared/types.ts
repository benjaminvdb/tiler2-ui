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
