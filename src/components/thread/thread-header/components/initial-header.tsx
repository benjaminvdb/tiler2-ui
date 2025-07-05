import AuthButtons from "@/components/auth-buttons";
import { HistoryToggleButton } from "./history-toggle-button";

interface InitialHeaderProps {
  chatHistoryOpen: boolean;
  isLargeScreen: boolean;
  onToggleChatHistory: () => void;
}

export function InitialHeader({
  chatHistoryOpen,
  isLargeScreen,
  onToggleChatHistory,
}: InitialHeaderProps) {
  return (
    <div className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-3 p-2 pl-4">
      <div>
        <HistoryToggleButton
          chatHistoryOpen={chatHistoryOpen}
          isLargeScreen={isLargeScreen}
          onToggleChatHistory={onToggleChatHistory}
        />
      </div>
      <div className="absolute top-2 right-4 flex items-center">
        <AuthButtons />
      </div>
    </div>
  );
}
