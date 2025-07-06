import { SquarePen } from "lucide-react";
import AuthButtons from "@/components/auth-buttons";
import { TooltipIconButton } from "../../tooltip-icon-button";
import { useUIContext } from "@/providers/ui";

export function HeaderActions() {
  const { onNewThread } = useUIContext();
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center">
        <AuthButtons />
      </div>
      <TooltipIconButton
        size="lg"
        className="p-4"
        tooltip="New thread"
        variant="ghost"
        onClick={onNewThread}
      >
        <SquarePen className="size-5" />
      </TooltipIconButton>
    </div>
  );
}
