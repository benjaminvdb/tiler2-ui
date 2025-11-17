import React, { createContext, useContext, ReactNode } from "react";
import { NavigationService } from "@/core/services/navigation";

interface UIContextType {
  chatHistoryOpen: boolean;
  isLargeScreen: boolean;
  sidePanelWidth: number;

  navigationService: NavigationService;

  onToggleChatHistory: () => void;
  onNewThread: () => void;
  onSidePanelWidthChange: (width: number) => void;
}
const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
  value: UIContextType;
}
export const UIProvider: React.FC<UIProviderProps> = ({ children, value }) => {
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUIContext = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUIContext must be used within a UIProvider");
  }
  return context;
};
