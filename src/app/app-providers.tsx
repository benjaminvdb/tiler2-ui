"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { UIProvider } from "@/features/chat/providers/ui-provider";
import { ThreadProvider } from "@/features/thread/providers/thread-provider";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useQueryState } from "nuqs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Toaster } from "@/shared";
interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps): React.ReactNode {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // UI state management
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    {
      defaultValue: false,
      parse: (value) => value === "true",
      serialize: (value) => value.toString(),
    },
  );

  const [_threadId, setThreadId] = useQueryState("threadId", {
    defaultValue: null,
    parse: (value) => (value ? value : null),
    serialize: (value) => value || "",
  });

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

  const handleNewThread = useCallback(() => {
    console.log("Starting new thread - clearing threadId");

    // If we're on the workflows page, navigate to home first
    if (pathname === "/workflows") {
      // Preserve existing query parameters
      const params = new URLSearchParams(searchParams);
      params.delete("threadId"); // Remove threadId to start new thread
      params.delete("workflow"); // Remove workflow parameter
      const queryString = params.toString();
      router.replace(queryString ? `/?${queryString}` : "/");
    } else {
      // Clear threadId to start a new thread
      // nuqs will automatically update the URL
      setThreadId(null);
    }
  }, [setThreadId, pathname, router, searchParams]);

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
      onToggleChatHistory: handleToggleChatHistory,
      onNewThread: handleNewThread,
      onSidePanelWidthChange: handleSidePanelWidthChange,
    }),
    [
      chatHistoryOpen,
      isLargeScreen,
      sidePanelWidth,
      handleToggleChatHistory,
      handleNewThread,
      handleSidePanelWidthChange,
    ],
  );

  return (
    <>
      <Toaster />
      <UIProvider value={uiContextValue}>
        <ThreadProvider>{children}</ThreadProvider>
      </UIProvider>
    </>
  );
}
