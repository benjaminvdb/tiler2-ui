"use client";

import * as React from "react";
import { Plus, GitBranch, BookOpen } from "lucide-react";
import Image from "next/image";
import { Thread } from "@langchain/langgraph-sdk";
import { useQueryState } from "nuqs";

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
  SidebarTrigger,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { extractThreadDisplayText } from "../components/thread-history/utils/thread-text-extractor";
import { useThreadHistory } from "../components/thread-history/hooks/use-thread-history";
import { SidebarUserProfile } from "@/features/auth/components/sidebar-user-profile";
import { getShortcutText } from "@/features/hotkeys";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { navigateExternal } from "@/core/services/navigation";

export const NewSidebar = (): React.JSX.Element => {
  const { navigationService, onNewThread } = useUIContext();
  const [threadId, setThreadId] = useQueryState("threadId");
  const { threads, threadsLoading } = useThreadHistory();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleThreadClick = (clickedThreadId: string) => {
    if (clickedThreadId === threadId) return;
    setThreadId(clickedThreadId);
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
        <div className="flex items-center justify-between gap-2 px-2 py-2">
          {/* Link Logo - Clickable to start new chat */}
          <button
            onClick={onNewThread}
            className="flex flex-1 items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group-data-[collapsible=icon]:hidden"
            aria-label="Start New Chat"
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
          <SidebarTrigger />
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
                  onClick={onNewThread}
                  tooltip={{
                    children: (
                      <div className="text-center">
                        <p className="font-medium">Start New Chat</p>
                        <p className="text-white/60 mt-1 text-xs">
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
                  <span className="font-medium">New Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Workflows Navigation */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigate("workflows")}
                  tooltip={{
                    children: (
                      <div className="text-center">
                        <p className="font-medium">Browse Workflows</p>
                        <p className="text-white/60 mt-1 text-xs">
                          {getShortcutText("workflows")}
                        </p>
                      </div>
                    ),
                  }}
                >
                  <GitBranch className="h-4 w-4" />
                  <span>Workflows</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Wiki Navigation */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNavigate("wiki")}
                  tooltip="Knowledge Base"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Wiki</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

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

      {/* User Profile Footer */}
      <SidebarUserProfile />

      {/* Resize Handle */}
      <SidebarRail />
    </Sidebar>
  );
};
