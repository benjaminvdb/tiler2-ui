"use client";

import React from "react";
import { SidePanel } from "@/features/side-panel";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { AppProviders } from "./app-providers";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { AuthButtons } from "@/features/auth/components";
import { motion } from "framer-motion";
import { SIDE_PANEL_COLLAPSED_WIDTH } from "@/features/side-panel/constants";

// Removed GlobalToggleButton - expand button is now only in the sidebar

const GlobalHeader: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 z-10 flex w-full items-center justify-end gap-3 p-2 pr-4">
      <div className="flex items-center">
        <AuthButtons />
      </div>
    </div>
  );
};

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
        className="relative flex-1"
        animate={{ marginLeft, width }}
        transition={
          isLargeScreen
            ? { type: "spring", stiffness: 300, damping: 30 }
            : { duration: 0 }
        }
        layout
      >
        <GlobalHeader />
        <main className="h-full overflow-hidden pt-16">{children}</main>
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
