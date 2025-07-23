"use client";

import React from "react";
import { MessageCircle, Workflow, BookOpen } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { NavigationButton } from "./navigation-button";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { LucideIcon } from "lucide-react";

interface MenuItemConfig {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
  shortcut?: "new-chat" | "workflows";
}

const menuItems: MenuItemConfig[] = [
  {
    id: "new-chat",
    icon: MessageCircle,
    label: "New Chat",
    path: "/",
    shortcut: "new-chat",
  },
  {
    id: "workflows",
    icon: Workflow,
    label: "Workflows",
    path: "/workflows",
    shortcut: "workflows",
  },
  {
    id: "wiki",
    icon: BookOpen,
    label: "Wiki",
    path: "https://impossible-chauffeur-129.notion.site/Link-Chat-Wiki-218b67580800806ea99efb583280d2c8",
  },
];

export const SidePanelNavigation: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { chatHistoryOpen, onNewThread } = useUIContext();

  const handleNavigation = (path: string) => {
    if (path === "/") {
      // For new chat, use onNewThread to properly reset threadId
      onNewThread();
    } else if (path.startsWith("http")) {
      // For external links, open in new tab
      window.open(path, "_blank", "noopener,noreferrer");
    } else {
      console.log("Navigating to:", path);
      // Preserve the chatHistoryOpen state when navigating
      const currentParams = new URLSearchParams(searchParams);
      const newUrl = currentParams.toString()
        ? `${path}?${currentParams.toString()}`
        : path;
      console.log("Final URL:", newUrl);
      router.push(newUrl);
    }
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    if (path.startsWith("http")) {
      // External links are never active
      return false;
    }
    return pathname.startsWith(path);
  };

  const isCollapsed = !chatHistoryOpen;

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
          isActive={isActive(item.path)}
          onClick={() => handleNavigation(item.path)}
          isCollapsed={isCollapsed}
          shortcut={item.shortcut}
        />
      ))}
    </div>
  );
};
