import { RefreshCcw, Pencil } from "lucide-react";
import { TooltipIconButton } from "../../../../../tooltip-icon-button";
import { ContentCopyable } from "../../content-copyable";

interface MessageActionsProps {
  content: string;
  isLoading: boolean;
  isAiMessage?: boolean;
  showEdit: boolean;
  handleRegenerate?: () => void;
  setIsEditing?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MessageActions({
  content,
  isLoading,
  isAiMessage,
  showEdit,
  handleRegenerate,
  setIsEditing,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <ContentCopyable
        content={content}
        disabled={isLoading}
      />
      {isAiMessage && !!handleRegenerate && (
        <TooltipIconButton
          disabled={isLoading}
          tooltip="Refresh"
          variant="ghost"
          onClick={handleRegenerate}
        >
          <RefreshCcw />
        </TooltipIconButton>
      )}
      {showEdit && (
        <TooltipIconButton
          disabled={isLoading}
          tooltip="Edit"
          variant="ghost"
          onClick={() => setIsEditing?.(true)}
        >
          <Pencil />
        </TooltipIconButton>
      )}
    </div>
  );
}
