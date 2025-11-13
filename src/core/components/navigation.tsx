import React from "react";
import {
  MessageCircle,
  Workflow,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { NavigationButton } from "@/features/side-panel/components/navigation-button";
import { navigateExternal } from "@/core/services/navigation";

interface NavigationMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
  isActive: boolean;
  shortcut?: "new-chat" | "workflows";
}

interface NavigationProps {
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  isCollapsed = false,
  onNavigate,
}) => {
  const { navigationService } = useUIContext();
  const { pathname } = useLocation();

  const menuItems: NavigationMenuItem[] = [
    {
      id: "new-chat",
      label: "New Chat",
      icon: MessageCircle,
      action: () => {
        navigationService.navigateToHome();
        onNavigate?.();
      },
      isActive: navigationService.isHomePage(pathname),
      shortcut: "new-chat",
    },
    {
      id: "workflows",
      label: "Workflows",
      icon: Workflow,
      action: () => {
        navigationService.navigateToWorkflows();
        onNavigate?.();
      },
      isActive: navigationService.isWorkflowsPage(pathname),
      shortcut: "workflows",
    },
    {
      id: "wiki",
      label: "Wiki",
      icon: BookOpen,
      action: () => {
        navigateExternal(
          "https://impossible-chauffeur-129.notion.site/Link-Chat-Wiki-218b67580800806ea99efb583280d2c8",
        );
        onNavigate?.();
      },
      isActive: false,
    },
  ];

  return (
    <div
      className={`flex w-full flex-col space-y-1 py-2 ${
        isCollapsed ? "items-center px-1" : "px-2"
      }`}
    >
      {menuItems.map((item) => (
        <NavigationButton
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={item.isActive}
          onClick={item.action}
          isCollapsed={isCollapsed}
          shortcut={item.shortcut}
        />
      ))}
    </div>
  );
};
