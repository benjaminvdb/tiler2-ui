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

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Feature-specific providers for UI state, thread management, hotkeys, and streaming.
 * Manages search param synchronization for thread/UI state, side panel width persistence,
 * and Sentry context tracking.
 * @param children - Child components to wrap with providers
 * @returns Nested providers with all feature contexts
 */
export function AppProviders({ children }: AppProvidersProps): React.ReactNode {
  const navigate = useNavigate();

  const [chatHistoryOpen, setChatHistoryOpen] =
    useSearchParamState("chatHistoryOpen");

  const [threadId, setThreadId] = useSearchParamState("threadId");

  // Sync thread ID to Sentry for error context and user tracking
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

  // Restore side panel width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem("sidePanelWidth");
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= 250 && width <= 600) {
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

  // Clear active thread and navigate to home page
  const handleNewThread = useCallback(() => {
    setThreadId(null);
    navigationService.navigateToHome();
  }, [setThreadId, navigationService]);

  const handleSidePanelWidthChange = useCallback((width: number) => {
    // Clamp to valid range: 250px (min sidebar width) to 600px (max practical width)
    const constrainedWidth = Math.min(Math.max(width, 250), 600);
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
