"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { UIProvider } from "@/features/chat/providers/ui-provider";
import { ThreadProvider } from "@/features/thread/providers/thread-provider";
import { HotkeysProvider } from "@/features/hotkeys";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import { Toaster } from "@/shared";
import { createNavigationService } from "@/core/services/navigation";
import { StreamProvider } from "@/core/providers/stream";
import { LoggerProvider } from "@/core/services/logging";
import * as Sentry from "@sentry/nextjs";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): React.ReactNode {
  const router = useRouter();

  // UI state management
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    {
      defaultValue: false,
      parse: (value) => value === "true",
      serialize: (value) => value.toString(),
    },
  );

  const [threadId, setThreadId] = useQueryState("threadId", {
    defaultValue: null,
    parse: (value) => (value ? value : null),
    serialize: (value) => value || "",
  });

  // Set Sentry context when threadId changes
  useEffect(() => {
    if (threadId) {
      Sentry.setContext("thread", {
        id: threadId,
      });
      Sentry.setTag("thread_id", threadId);
    } else {
      // Clear thread context when no thread is active
      Sentry.setContext("thread", null);
      Sentry.setTag("thread_id", undefined);
    }
  }, [threadId]);

  // Side panel width state with localStorage persistence
  const [sidePanelWidth, setSidePanelWidth] = useState(350);

  // Load saved width from localStorage on component mount
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

  // Memoized callback functions to prevent unnecessary rerenders
  const handleToggleChatHistory = useCallback(() => {
    setChatHistoryOpen(!chatHistoryOpen);
  }, [chatHistoryOpen, setChatHistoryOpen]);

  const navigationService = useMemo(
    () => createNavigationService(router),
    [router],
  );

  // Simplified new thread handler - just clear thread ID and go to home
  const handleNewThread = useCallback(() => {
    setThreadId(null);
    navigationService.navigateToHome();
  }, [setThreadId, navigationService]);

  const handleSidePanelWidthChange = useCallback((width: number) => {
    // Constrain width between 250px and 600px
    const constrainedWidth = Math.min(Math.max(width, 250), 600);
    setSidePanelWidth(constrainedWidth);
    localStorage.setItem("sidePanelWidth", constrainedWidth.toString());
  }, []);

  const uiContextValue = useMemo(
    () => ({
      chatHistoryOpen,
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
      <LoggerProvider>
        <UIProvider value={uiContextValue}>
          <HotkeysProvider>
            <ThreadProvider>
              <StreamProvider>{children}</StreamProvider>
            </ThreadProvider>
          </HotkeysProvider>
        </UIProvider>
      </LoggerProvider>
    </>
  );
}
