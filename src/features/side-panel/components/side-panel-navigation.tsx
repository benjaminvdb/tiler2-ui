"use client";

import React from "react";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { Navigation } from "@/core/components/navigation";

export const SidePanelNavigation: React.FC = () => {
  const { chatHistoryOpen } = useUIContext();
  const isCollapsed = !chatHistoryOpen;

  return <Navigation isCollapsed={isCollapsed} />;
};
