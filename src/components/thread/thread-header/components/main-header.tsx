import { HistoryToggleButton } from "./history-toggle-button";
import { BrandLogo } from "./brand-logo";
import { HeaderActions } from "./header-actions";

interface MainHeaderProps {
  chatHistoryOpen: boolean;
  isLargeScreen: boolean;
  onToggleChatHistory: () => void;
  onNewThread: () => void;
}

export function MainHeader({
  chatHistoryOpen,
  isLargeScreen,
  onToggleChatHistory,
  onNewThread,
}: MainHeaderProps) {
  return (
    <div className="relative z-10 flex items-center justify-between gap-3 p-2">
      <div className="relative flex items-center justify-start gap-2">
        <div className="absolute left-0 z-10">
          <HistoryToggleButton
            chatHistoryOpen={chatHistoryOpen}
            isLargeScreen={isLargeScreen}
            onToggleChatHistory={onToggleChatHistory}
          />
        </div>
        <BrandLogo
          chatHistoryOpen={chatHistoryOpen}
          onNewThread={onNewThread}
        />
      </div>
      <HeaderActions onNewThread={onNewThread} />
      <div className="from-background to-background/0 absolute inset-x-0 top-full h-5 bg-gradient-to-b" />
    </div>
  );
}
