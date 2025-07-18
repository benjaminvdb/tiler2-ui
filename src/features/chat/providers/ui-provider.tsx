import React, { createContext, useContext, ReactNode } from "react";

interface UIContextType {
  // UI state
  chatHistoryOpen: boolean;
  isLargeScreen: boolean;

  // UI actions
  onToggleChatHistory: () => void;
  onNewThread: () => void;
}
const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
  value: UIContextType;
}
export const UIProvider: React.FC<UIProviderProps> = ({ children, value }) => {
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUIContext must be used within a UIProvider");
  }
  return context;
};
