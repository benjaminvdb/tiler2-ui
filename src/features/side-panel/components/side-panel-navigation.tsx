"use client";

import React from "react";
import { MessageCircle, Workflow } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { NavigationButton } from "./navigation-button";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { LucideIcon } from "lucide-react";

interface MenuItemConfig {
  id: string;
  icon: LucideIcon;
  label: string;
  path: string;
}

const menuItems: MenuItemConfig[] = [
  {
    id: "new-chat",
    icon: MessageCircle,
    label: "New Chat",
    path: "/",
  },
  {
    id: "workflows",
    icon: Workflow,
    label: "Workflows",
    path: "/workflows",
  },
];

export const SidePanelNavigation: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { chatHistoryOpen } = useUIContext();

  const handleNavigation = (path: string) => {
    console.log("Navigating to:", path);
    // Preserve the chatHistoryOpen state when navigating
    const currentParams = new URLSearchParams(searchParams);
    const newUrl = currentParams.toString()
      ? `${path}?${currentParams.toString()}`
      : path;
    console.log("Final URL:", newUrl);
    router.push(newUrl);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const isCollapsed = !chatHistoryOpen;

  return (
    <div
      className={`flex w-full flex-col space-y-1 border-b border-slate-200 py-2 ${
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
        />
      ))}
    </div>
  );
};
