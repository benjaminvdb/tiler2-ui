import React from "react";
import { SidePanelLayout } from "./side-panel-layout";
import { SidePanelContent } from "./side-panel-content";

export const SidePanel: React.FC = () => {
  return (
    <SidePanelLayout>
      <SidePanelContent />
    </SidePanelLayout>
  );
};
