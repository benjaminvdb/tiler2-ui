"use client";

import React from "react";
import { SidePanel } from "@/features/side-panel";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { AppProviders } from "./app-providers";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { motion } from "framer-motion";
import { SIDE_PANEL_COLLAPSED_WIDTH } from "@/features/side-panel/constants";
import { MobileHeader } from "@/features/side-panel/components/mobile-header";

// Removed GlobalToggleButton - expand button is now only in the sidebar


interface AppLayoutContentProps {
  children: React.ReactNode;
}

function AppLayoutContent({
  children,
}: AppLayoutContentProps): React.ReactNode {
  const { chatHistoryOpen, sidePanelWidth, isLargeScreen } = useUIContext();

  // Calculate animation values
  const currentSidePanelWidth = chatHistoryOpen
    ? sidePanelWidth
    : SIDE_PANEL_COLLAPSED_WIDTH;
  const marginLeft = isLargeScreen ? currentSidePanelWidth : 0;
  const width = isLargeScreen
    ? `calc(100% - ${currentSidePanelWidth}px)`
    : "100%";

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SidePanel />
      <motion.div
        className="relative flex-1 flex flex-col"
        animate={{ marginLeft, width }}
        transition={
          isLargeScreen
            ? { type: "spring", stiffness: 300, damping: 30 }
            : { duration: 0 }
        }
        layout
      >
        <MobileHeader />
        <main className="flex-1 overflow-hidden">{children}</main>
      </motion.div>
    </div>
  );
}

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps): React.ReactNode {
  return (
    <ErrorBoundary>
      <React.Suspense
        fallback={
          <div className="bg-background flex h-screen w-full items-center justify-center">
            <div className="text-center">
              <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            </div>
          </div>
        }
      >
        <AppProviders>
          <AppLayoutContent>{children}</AppLayoutContent>
        </AppProviders>
      </React.Suspense>
    </ErrorBoundary>
  );
}
