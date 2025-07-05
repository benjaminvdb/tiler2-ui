import { InitialHeader, MainHeader } from "./components";

interface ThreadHeaderProps {
  chatStarted: boolean;
  chatHistoryOpen: boolean;
  isLargeScreen: boolean;
  onToggleChatHistory: () => void;
  onNewThread: () => void;
}

export function ThreadHeader({
  chatStarted,
  chatHistoryOpen,
  isLargeScreen,
  onToggleChatHistory,
  onNewThread,
}: ThreadHeaderProps) {
  if (!chatStarted) {
    return (
      <InitialHeader
        chatHistoryOpen={chatHistoryOpen}
        isLargeScreen={isLargeScreen}
        onToggleChatHistory={onToggleChatHistory}
      />
    );
  }

  return (
    <MainHeader
      chatHistoryOpen={chatHistoryOpen}
      isLargeScreen={isLargeScreen}
      onToggleChatHistory={onToggleChatHistory}
      onNewThread={onNewThread}
    />
  );
}
