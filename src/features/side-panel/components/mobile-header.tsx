"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { AuthButtons } from "@/features/auth/components";
import { NavigationButton } from "./navigation-button";
import { MessageCircle, Workflow, BookOpen } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { LinkLogoSVG } from "@/shared/components/icons/link";
import { ThreadList } from "./thread-history/components/thread-list";
import { ThreadHistoryLoading } from "./thread-history/components/thread-history-loading";
import { useThreadHistory } from "./thread-history/hooks/use-thread-history";

export const MobileHeader: React.FC = () => {
  const { threads, threadsLoading } = useThreadHistory();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { onNewThread } = useUIContext();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (path: string) => {
    if (path === "/") {
      // For new chat, use onNewThread to properly reset threadId
      onNewThread();
    } else if (path.startsWith("http")) {
      // For external links, open in new tab
      window.open(path, "_blank", "noopener,noreferrer");
    } else {
      // Preserve the chatHistoryOpen state when navigating
      const currentParams = new URLSearchParams(searchParams);
      const newUrl = currentParams.toString()
        ? `${path}?${currentParams.toString()}`
        : path;
      router.push(newUrl);
    }
    // Close the mobile menu after navigation
    setIsOpen(false);
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

  return (
    <div className="border-b bg-white lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Hamburger Menu Button (Top Left) */}
        <Sheet
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex max-h-screen w-80 flex-col"
          >
            <SheetHeader>
              <SheetTitle className="flex items-center justify-start">
                {/* Brand Logo + Text (Always Visible) */}
                <div className="flex items-center gap-2">
                  <LinkLogoSVG
                    width={24}
                    height={24}
                  />
                  <span className="text-lg font-semibold tracking-tight">
                    Link Chat
                  </span>
                </div>
              </SheetTitle>
            </SheetHeader>

            {/* Navigation Section */}
            <div className="mt-6">
              <div className="flex w-full flex-col space-y-1 px-2 py-2">
                <NavigationButton
                  icon={MessageCircle}
                  label="New Chat"
                  isActive={isActive("/")}
                  onClick={() => handleNavigation("/")}
                  isCollapsed={false}
                  shortcut="new-chat"
                />
                <NavigationButton
                  icon={Workflow}
                  label="Workflows"
                  isActive={isActive("/workflows")}
                  onClick={() => handleNavigation("/workflows")}
                  isCollapsed={false}
                  shortcut="workflows"
                />
                <NavigationButton
                  icon={BookOpen}
                  label="Wiki"
                  isActive={isActive(
                    "https://impossible-chauffeur-129.notion.site/Link-Chat-Wiki-218b67580800806ea99efb583280d2c8",
                  )}
                  onClick={() =>
                    handleNavigation(
                      "https://impossible-chauffeur-129.notion.site/Link-Chat-Wiki-218b67580800806ea99efb583280d2c8",
                    )
                  }
                  isCollapsed={false}
                />
              </div>
            </div>

            {/* Thread History Section */}
            <div className="mt-6 flex min-h-0 flex-1 flex-col">
              <div className="mb-4 px-2">
                <h2 className="text-sm font-medium tracking-tight">
                  Chat History
                </h2>
              </div>
              <div className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex-1 overflow-y-auto overscroll-contain px-4">
                {threadsLoading ? (
                  <ThreadHistoryLoading />
                ) : (
                  <ThreadList
                    threads={threads}
                    onThreadClick={() => setIsOpen(false)}
                  />
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Profile/Auth Button (Top Right) */}
        <AuthButtons />
      </div>
    </div>
  );
};
