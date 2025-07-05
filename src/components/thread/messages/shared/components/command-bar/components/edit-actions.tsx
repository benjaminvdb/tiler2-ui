import { XIcon, SendHorizontal } from "lucide-react";
import { TooltipIconButton } from "../../../../../tooltip-icon-button";

interface EditActionsProps {
  isLoading: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmitEdit: () => void;
}

export function EditActions({
  isLoading,
  setIsEditing,
  handleSubmitEdit,
}: EditActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <TooltipIconButton
        disabled={isLoading}
        tooltip="Cancel edit"
        variant="ghost"
        onClick={() => setIsEditing(false)}
      >
        <XIcon />
      </TooltipIconButton>
      <TooltipIconButton
        disabled={isLoading}
        tooltip="Submit"
        variant="secondary"
        onClick={handleSubmitEdit}
      >
        <SendHorizontal />
      </TooltipIconButton>
    </div>
  );
}
