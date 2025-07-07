import React from "react";
import { useThreadHistory } from "./hooks/use-thread-history";
import { DesktopHistoryPanel } from "./components/desktop-history-panel";
import { MobileHistorySheet } from "./components/mobile-history-sheet";

export const ThreadHistory = (): React.JSX.Element => {
  const {
    isLargeScreen,
    chatHistoryOpen,
    setChatHistoryOpen,
    threads,
    threadsLoading,
  } = useThreadHistory();

  return (
    <>
      <DesktopHistoryPanel
        chatHistoryOpen={chatHistoryOpen}
        setChatHistoryOpen={setChatHistoryOpen}
        threads={threads}
        threadsLoading={threadsLoading}
      />
      <MobileHistorySheet
        chatHistoryOpen={chatHistoryOpen}
        setChatHistoryOpen={setChatHistoryOpen}
        isLargeScreen={isLargeScreen}
        threads={threads}
      />
    </>
  );
};
