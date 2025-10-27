"use client";

import * as React from "react";
import {
  Plus,
  GitBranch,
  BookOpen,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import Image from "next/image";
import { Thread } from "@langchain/langgraph-sdk";
import { useSearchParamState } from "@/core/routing/hooks";
import { useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Button } from "@/shared/components/ui/button";
import { extractThreadDisplayText } from "../components/thread-history/utils/thread-text-extractor";
import { useThreadHistory } from "../components/thread-history/hooks/use-thread-history";
import { SidebarUserProfile } from "@/features/auth/components/sidebar-user-profile";
import { getShortcutText } from "@/features/hotkeys";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { navigateExternal } from "@/core/services/navigation";

export const NewSidebar = (): React.JSX.Element => {
  const { navigationService } = useUIContext();
  const [threadId] = useSearchParamState("threadId");
  const { threads, threadsLoading } = useThreadHistory();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const router = useRouter();

  // Navigation labels - single source of truth for button text and tooltips
  const LABEL_NEW_CHAT = "New Chat";
  const LABEL_WORKFLOWS = "Workflows";
  const LABEL_WIKI = "Wiki";

  const handleThreadClick = (clickedThreadId: string) => {
    if (clickedThreadId === threadId) return;
    // Use router.replace to create a clean URL with only threadId, removing any workflow parameter
    router.replace(`/?threadId=${clickedThreadId}`);
  };

  const handleNavigate = (section: "workflows" | "wiki") => {
    if (section === "workflows") {
      navigationService.navigateToWorkflows();
    } else {
      navigateExternal(
        "https://impossible-chauffeur-129.notion.site/Link-Chat-Wiki-218b67580800806ea99efb583280d2c8",
      );
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div
          className={`flex items-center gap-2 px-2 py-2 ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          {/* Link Logo - Clickable to navigate home */}
          <button
            onClick={() => navigationService.navigateToHome()}
            className="flex flex-1 cursor-pointer items-center gap-2 transition-opacity group-data-[collapsible=icon]:hidden hover:opacity-80"
            aria-label="Go to Home"
          >
            <Image
              src="/link.svg"
              alt="Link"
              width={25}
              height={8}
              className="object-contain"
              style={{ filter: "brightness(0)" }}
              priority
            />
          </button>

          {/* Collapse/Expand Button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-80 hover:opacity-100"
            onClick={toggleSidebar}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary Actions */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* New Chat Button - Highlighted in Forest Green */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigationService.navigateToHome()}
                  tooltip={{
                    children: (
                      <div className="text-center">
                        <p className="font-medium">{LABEL_NEW_CHAT}</p>
                        <p className="mt-1 text-xs text-white/60">
                          {getShortcutText("new-chat")}
                        </p>
                      </div>
                    ),
                  }}
                  style={{
                    backgroundColor: "var(--forest-green)",
                    color: "var(--off-white)",
                  }}
                  className="hover:opacity-90 data-[active=true]:opacity-100"
                >
                  <Plus
                    className="h-4 w-4"
                    strokeWidth={2}
                  />
                  <span className="font-medium">{LABEL_NEW_CHAT}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Workflows Navigation */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigate("workflows")}
                  tooltip={{
                    children: (
                      <div className="text-center">
                        <p className="font-medium">{LABEL_WORKFLOWS}</p>
                        <p className="mt-1 text-xs text-white/60">
                          {getShortcutText("workflows")}
                        </p>
                      </div>
                    ),
                  }}
                >
                  <GitBranch className="h-4 w-4" />
                  <span>{LABEL_WORKFLOWS}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Wiki Navigation */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigate("wiki")}
                  tooltip={{
                    children: (
                      <div className="text-center">
                        <p className="font-medium">{LABEL_WIKI}</p>
                        <p
                          className="invisible mt-1 text-xs text-white/60"
                          aria-hidden="true"
                        >
                          &nbsp;
                        </p>
                      </div>
                    ),
                  }}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{LABEL_WIKI}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-2">
          <SidebarSeparator className="mx-0" />
        </div>

        {/* Thread History - Only show when expanded */}
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>CHATS</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {threadsLoading ? (
                  // Loading skeleton
                  <>
                    {[...Array(5)].map((_, i) => (
                      <SidebarMenuItem key={i}>
                        <SidebarMenuSkeleton showIcon />
                      </SidebarMenuItem>
                    ))}
                  </>
                ) : threads.length === 0 ? (
                  // No threads message
                  <div className="px-2 py-4 text-center">
                    <p className="text-muted-foreground text-xs">
                      No chats yet. Start a new conversation!
                    </p>
                  </div>
                ) : (
                  // Thread list
                  threads.map((thread: Thread) => {
                    const displayText = extractThreadDisplayText(thread);
                    const isActive = thread.thread_id === threadId;

                    return (
                      <SidebarMenuItem key={thread.thread_id}>
                        <SidebarMenuButton
                          onClick={() => handleThreadClick(thread.thread_id)}
                          isActive={isActive}
                          tooltip={displayText}
                        >
                          <span className="truncate">{displayText}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Divider above profile footer - wrapped for overflow clipping and padding */}
      <div className="overflow-x-hidden px-2">
        <SidebarSeparator className="mx-0" />
      </div>

      {/* User Profile Footer */}
      <SidebarUserProfile />

      {/* Resize Handle */}
      <SidebarRail />
    </Sidebar>
  );
};
