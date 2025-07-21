import React from "react";
import { SidePanelNavigation } from "./side-panel-navigation";
import { SidePanelBrandHeader } from "./side-panel-brand-header";
import { ThreadHistory } from "./thread-history";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { AuthButtons } from "@/features/auth/components";

export const SidePanelContent: React.FC = () => {
  const { chatHistoryOpen } = useUIContext();

  return (
    <div className="flex h-full flex-col">
      <SidePanelBrandHeader />
      <SidePanelNavigation />
      {chatHistoryOpen && (
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <h2 className="mb-2 text-sm font-medium tracking-tight">Chats</h2>
          </div>
          <ThreadHistory />
        </div>
      )}
      <div className="mt-auto p-4">
        <AuthButtons />
      </div>
    </div>
  );
};
