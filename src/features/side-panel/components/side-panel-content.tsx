import React from "react";
import { SidePanelNavigation } from "./side-panel-navigation";
import { SidePanelBrandHeader } from "./side-panel-brand-header";
import { ThreadHistory } from "./thread-history";

export const SidePanelContent: React.FC = () => {
  return (
    <>
      <SidePanelBrandHeader />
      <SidePanelNavigation />
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <h2 className="text-sm font-medium tracking-tight mb-2">Chats</h2>
        </div>
        <ThreadHistory />
      </div>
    </>
  );
};
