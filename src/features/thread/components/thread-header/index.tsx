import { Button } from "@/shared/components/ui/button";
import { PanelRightOpen, PanelRightClose, SquarePen } from "lucide-react";
import { AuthButtons } from "@/features/auth/components";
import { TooltipIconButton } from "../tooltip-icon-button";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { useChatContext } from "@/features/chat/providers/chat-provider";

const HistoryToggleButton: React.FC = () => {
  const { chatHistoryOpen, isLargeScreen, onToggleChatHistory } =
    useUIContext();
  const shouldShow = !chatHistoryOpen || !isLargeScreen;

  if (!shouldShow) {
    return null;
  }
  return (
    <Button
      className="hover:bg-gray-100"
      variant="ghost"
      onClick={onToggleChatHistory}
    >
      {chatHistoryOpen ? (
        <PanelRightOpen className="size-5" />
      ) : (
        <PanelRightClose className="size-5" />
      )}
    </Button>
  );
};

const HeaderActions: React.FC = () => {
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
};

const MainHeader: React.FC = () => {
  return (
    <div className="relative z-10 flex items-center justify-between gap-3 p-2">
      <div className="relative flex items-center justify-start gap-2">
        <HistoryToggleButton />
      </div>
      <HeaderActions />
      <div className="from-background to-background/0 absolute inset-x-0 top-full h-5 bg-gradient-to-b" />
    </div>
  );
};

const InitialHeader: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-3 p-2 pl-4">
      <div>
        <HistoryToggleButton />
      </div>
      <div className="absolute top-2 right-4 flex items-center">
        <AuthButtons />
      </div>
    </div>
  );
};

export const ThreadHeader: React.FC = () => {
  const { chatStarted } = useChatContext();

  if (!chatStarted) {
    return <InitialHeader />;
  }
  return <MainHeader />;
};
