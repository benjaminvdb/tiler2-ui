import React, { useCallback, useMemo, useState, useEffect } from "react";
import { UIProvider } from "@/features/chat/providers/ui-provider";
import { ThreadProvider } from "@/features/thread/providers/thread-provider";
import { HotkeysProvider } from "@/features/hotkeys";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useSearchParamState } from "@/core/routing/hooks";
import { useNavigate } from "react-router-dom";
import { Toaster } from "@/shared";
import { createNavigationService } from "@/core/services/navigation";
import { StreamProvider } from "@/core/providers/stream";
import * as Sentry from "@sentry/react";
import {
  SIDE_PANEL_MAX_WIDTH,
  SIDE_PANEL_MIN_WIDTH,
} from "@/features/side-panel/constants";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps): React.ReactNode => {
  const navigate = useNavigate();

  const [chatHistoryOpen, setChatHistoryOpen] =
    useSearchParamState("chatHistoryOpen");

  const [threadId, setThreadId] = useSearchParamState("threadId");

  useEffect(() => {
    if (threadId) {
      Sentry.setContext("thread", {
        id: threadId,
      });
      Sentry.setTag("thread_id", threadId);
    } else {
      Sentry.setContext("thread", null);
      Sentry.setTag("thread_id", undefined);
    }
  }, [threadId]);

  const [sidePanelWidth, setSidePanelWidth] = useState(350);

  useEffect(() => {
    const savedWidth = localStorage.getItem("sidePanelWidth");
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= SIDE_PANEL_MIN_WIDTH && width <= SIDE_PANEL_MAX_WIDTH) {
        setSidePanelWidth(width);
      }
    }
  }, []);

  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  const handleToggleChatHistory = useCallback(() => {
    setChatHistoryOpen(chatHistoryOpen ? null : true);
  }, [chatHistoryOpen, setChatHistoryOpen]);

  const navigationService = useMemo(
    () => createNavigationService(navigate),
    [navigate],
  );

  const handleNewThread = useCallback(() => {
    setThreadId(null);
    navigationService.navigateToHome();
  }, [setThreadId, navigationService]);

  const handleSidePanelWidthChange = useCallback((width: number) => {
    const constrainedWidth = Math.min(
      Math.max(width, SIDE_PANEL_MIN_WIDTH),
      SIDE_PANEL_MAX_WIDTH,
    );
    setSidePanelWidth(constrainedWidth);
    localStorage.setItem("sidePanelWidth", constrainedWidth.toString());
  }, []);

  const uiContextValue = useMemo(
    () => ({
      chatHistoryOpen: chatHistoryOpen === true,
      isLargeScreen,
      sidePanelWidth,
      navigationService,
      onToggleChatHistory: handleToggleChatHistory,
      onNewThread: handleNewThread,
      onSidePanelWidthChange: handleSidePanelWidthChange,
    }),
    [
      chatHistoryOpen,
      isLargeScreen,
      sidePanelWidth,
      navigationService,
      handleToggleChatHistory,
      handleNewThread,
      handleSidePanelWidthChange,
    ],
  );

  return (
    <>
      <Toaster />
      <UIProvider value={uiContextValue}>
        <HotkeysProvider>
          <ThreadProvider>
            <StreamProvider>{children}</StreamProvider>
          </ThreadProvider>
        </HotkeysProvider>
      </UIProvider>
    </>
  );
}
