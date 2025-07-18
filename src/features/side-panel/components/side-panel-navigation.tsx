"use client";

import React from "react";
import { MessageCircle, Workflow } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { NavigationButton } from "./navigation-button";

export const SidePanelNavigation: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    // Preserve the chatHistoryOpen state when navigating
    const currentParams = new URLSearchParams(searchParams);
    const newUrl = currentParams.toString()
      ? `${path}?${currentParams.toString()}`
      : path;
    console.log('Final URL:', newUrl);
    router.push(newUrl);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col w-full border-b border-slate-200 px-2 py-2 space-y-1">
      <NavigationButton
        icon={MessageCircle}
        label="New Chat"
        isActive={isActive("/")}
        onClick={() => handleNavigation("/")}
      />
      <NavigationButton
        icon={Workflow}
        label="Workflows"
        isActive={isActive("/workflows")}
        onClick={() => handleNavigation("/workflows")}
      />
    </div>
  );
};
