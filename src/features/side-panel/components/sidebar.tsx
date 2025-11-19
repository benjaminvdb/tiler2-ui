import * as React from "react";
import {
  Plus,
  GitBranch,
  BookOpen,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { Thread } from "@langchain/langgraph-sdk";
import { useSearchParamState } from "@/core/routing/hooks";
import { LinkLogoSVG } from "@/shared/components/icons/link";

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
import { useThreads } from "@/features/thread/providers/thread-provider";
import { ThreadActionsMenu } from "./thread-actions-menu";
import { ThreadTitle } from "./thread-title";
import { toast } from "sonner";
import { useIntersectionObserver } from "@/shared/hooks/use-intersection-observer";
import { PAGINATION_CONFIG } from "@/shared/constants/pagination";

// Generate stable IDs for loading skeleton items
const SKELETON_KEYS = Array.from({ length: 5 }, (_, i) => `skeleton-${i}`);

interface ThreadItemProps {
  thread: Thread;
  isActive: boolean;
  onThreadClick: (threadId: string) => void;
  onRename: (threadId: string, newTitle: string) => Promise<void>;
  onDelete: (threadId: string) => Promise<void>;
}

const ThreadItem = React.memo(function ThreadItem({
  thread,
  isActive,
  onThreadClick,
  onRename,
  onDelete,
}: ThreadItemProps) {
  const displayText = extractThreadDisplayText(thread);

  const handleClick = React.useCallback(() => {
    onThreadClick(thread.thread_id);
  }, [onThreadClick, thread.thread_id]);

  return (
    <SidebarMenuItem key={thread.thread_id}>
      <SidebarMenuButton
        onClick={handleClick}
        isActive={isActive}
        tooltip={displayText}
      >
        <ThreadTitle text={displayText} />
      </SidebarMenuButton>
      <ThreadActionsMenu
        threadId={thread.thread_id}
        threadTitle={displayText}
        onRename={onRename}
        onDelete={onDelete}
      />
    </SidebarMenuItem>
  );
});

/**
 * Header section with logo and collapse button
 */
interface SidebarHeaderSectionProps {
  isCollapsed: boolean;
  onNewChat: () => void;
  onToggleSidebar: () => void;
}

const SidebarHeaderSection: React.FC<SidebarHeaderSectionProps> = ({
  isCollapsed,
  onNewChat,
  onToggleSidebar,
}) => (
  <SidebarHeader>
    <div
      className={`flex items-center gap-2 px-2 py-2 ${isCollapsed ? "justify-center" : "justify-between"}`}
    >
      <button
        type="button"
        onClick={onNewChat}
        className="flex flex-1 cursor-pointer items-center gap-2 transition-opacity group-data-[collapsible=icon]:hidden hover:opacity-80"
        aria-label="Go to Home"
      >
        <LinkLogoSVG
          width={32}
          height={32}
          className="shrink-0"
        />
      </button>

      <Button
        variant="ghost"
        size="icon"
        className="size-7 opacity-80 hover:opacity-100"
        onClick={onToggleSidebar}
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
);

/**
 * Main navigation menu with New Chat, Workflows, and Wiki
 */
interface MainMenuProps {
  onNewChat: () => void;
  onWorkflows: () => void;
  onWiki: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onNewChat,
  onWorkflows,
  onWiki,
}) => (
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={onNewChat}
            tooltip={{
              children: (
                <div className="text-center">
                  <p className="font-medium">New Chat</p>
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
            <span className="font-medium">New Chat</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={onWorkflows}
            tooltip={{
              children: (
                <div className="text-center">
                  <p className="font-medium">Workflows</p>
                  <p className="mt-1 text-xs text-white/60">
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

        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={onWiki}
            tooltip={{
              children: (
                <div className="text-center">
                  <p className="font-medium">Wiki</p>
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
            <span>Wiki</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
);

/**
 * Thread list section with loading and empty states
 */
interface ThreadListProps {
  threads: Thread[];
  threadsLoading: boolean;
  threadId: string | null;
  onThreadClick: (threadId: string) => void;
  onRename: (threadId: string, newTitle: string) => Promise<void>;
  onDelete: (threadId: string) => Promise<void>;
  loadMoreThreads: () => Promise<void>;
  hasMoreThreads: boolean;
  isLoadingMore: boolean;
}

const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  threadsLoading,
  threadId,
  onThreadClick,
  onRename,
  onDelete,
  loadMoreThreads,
  hasMoreThreads,
  isLoadingMore,
}) => {
  const sentinelRef = useIntersectionObserver(loadMoreThreads, {
    rootMargin: PAGINATION_CONFIG.PREFETCH_THRESHOLD,
    enabled: hasMoreThreads && !isLoadingMore && !threadsLoading,
    debounceMs: PAGINATION_CONFIG.SCROLL_DEBOUNCE_MS,
  });

  return (
    <div className="scrollbar-sidebar flex min-h-0 flex-1 flex-col overflow-y-auto">
      <SidebarGroup>
        <SidebarGroupLabel>CHATS</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {threadsLoading ? (
              <>
                {SKELETON_KEYS.map((key) => (
                  <SidebarMenuItem key={key}>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                ))}
              </>
            ) : threads.length === 0 ? (
              <div className="px-2 py-4 text-center">
                <p className="text-muted-foreground text-xs">
                  No chats yet. Start a new conversation!
                </p>
              </div>
            ) : (
              <>
                {threads.map((thread: Thread) => (
                  <ThreadItem
                    key={thread.thread_id}
                    thread={thread}
                    isActive={thread.thread_id === threadId}
                    onThreadClick={onThreadClick}
                    onRename={onRename}
                    onDelete={onDelete}
                  />
                ))}

                {hasMoreThreads && (
                  <div
                    ref={sentinelRef}
                    className="h-4"
                    aria-hidden="true"
                  />
                )}

                {isLoadingMore && (
                  <div className="px-2 py-2">
                    <div
                      className="text-muted-foreground w-full rounded-md px-2 py-2 text-center text-xs"
                      role="status"
                      aria-live="polite"
                    >
                      Loading more threads...
                    </div>
                  </div>
                )}

                {!isLoadingMore && hasMoreThreads && (
                  <div className="px-2 py-2">
                    <button
                      type="button"
                      onClick={loadMoreThreads}
                      className="hover:bg-accent w-full rounded-md px-2 py-2 text-xs transition-colors"
                      aria-label="Load more threads"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
};

/**
 * Hook for sidebar event handlers
 */
function useSidebarHandlers(
  threadId: string | null,
  navigationService: ReturnType<typeof useUIContext>["navigationService"],
  deleteThread: (threadId: string) => Promise<void>,
  renameThread: (threadId: string, newTitle: string) => Promise<void>,
) {
  const handleThreadClick = React.useCallback(
    (clickedThreadId: string) => {
      if (clickedThreadId === threadId) return;
      navigationService.navigateToHome({ threadId: clickedThreadId });
    },
    [threadId, navigationService],
  );

  const handleNavigate = React.useCallback(
    (section: "workflows" | "wiki") => {
      if (section === "workflows") {
        navigationService.navigateToWorkflows();
      } else {
        navigateExternal(
          "https://impossible-chauffeur-129.notion.site/Link-Chat-Wiki-218b67580800806ea99efb583280d2c8",
        );
      }
    },
    [navigationService],
  );

  const handleRename = React.useCallback(
    async (targetThreadId: string, newTitle: string): Promise<void> => {
      try {
        await renameThread(targetThreadId, newTitle);
        toast.success("Thread renamed successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to rename thread",
        );
        throw error;
      }
    },
    [renameThread],
  );

  const handleDelete = React.useCallback(
    async (targetThreadId: string): Promise<void> => {
      try {
        await deleteThread(targetThreadId);
        toast.success("Thread deleted successfully");

        if (targetThreadId === threadId) {
          navigationService.navigateToHome();
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete thread",
        );
        throw error;
      }
    },
    [deleteThread, threadId, navigationService],
  );

  const handleNewChatClick = React.useCallback(() => {
    navigationService.navigateToHome();
  }, [navigationService]);

  const handleWorkflowsClick = React.useCallback(() => {
    handleNavigate("workflows");
  }, [handleNavigate]);

  const handleWikiClick = React.useCallback(() => {
    handleNavigate("wiki");
  }, [handleNavigate]);

  return {
    handleThreadClick,
    handleRename,
    handleDelete,
    handleNewChatClick,
    handleWorkflowsClick,
    handleWikiClick,
  };
}

export const AppSidebar = (): React.JSX.Element => {
  const { navigationService } = useUIContext();
  const [threadId] = useSearchParamState("threadId");
  const { threads, threadsLoading } = useThreadHistory();
  const {
    deleteThread,
    renameThread,
    loadMoreThreads,
    hasMoreThreads,
    isLoadingMore,
  } = useThreads();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const {
    handleThreadClick,
    handleRename,
    handleDelete,
    handleNewChatClick,
    handleWorkflowsClick,
    handleWikiClick,
  } = useSidebarHandlers(
    threadId,
    navigationService,
    deleteThread,
    renameThread,
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeaderSection
        isCollapsed={isCollapsed}
        onNewChat={handleNewChatClick}
        onToggleSidebar={toggleSidebar}
      />

      <SidebarContent>
        <MainMenu
          onNewChat={handleNewChatClick}
          onWorkflows={handleWorkflowsClick}
          onWiki={handleWikiClick}
        />

        <div className="px-2">
          <SidebarSeparator className="mx-0" />
        </div>

        {!isCollapsed && (
          <ThreadList
            threads={threads}
            threadsLoading={threadsLoading}
            threadId={threadId}
            onThreadClick={handleThreadClick}
            onRename={handleRename}
            onDelete={handleDelete}
            loadMoreThreads={loadMoreThreads}
            hasMoreThreads={hasMoreThreads}
            isLoadingMore={isLoadingMore}
          />
        )}
      </SidebarContent>

      <div className="overflow-x-hidden px-2">
        <SidebarSeparator className="mx-0" />
      </div>

      <SidebarUserProfile />

      <SidebarRail />
    </Sidebar>
  );
};
