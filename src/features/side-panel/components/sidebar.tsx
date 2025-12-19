import * as React from "react";
import {
  Plus,
  GitBranch,
  Lightbulb,
  BookOpen,
  FileSpreadsheet,
  Target,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
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
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { Button } from "@/shared/components/ui/button";
import { SidebarUserProfile } from "@/features/auth/components/sidebar-user-profile";
import { getShortcutText } from "@/features/hotkeys";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { navigateExternal } from "@/core/services/navigation";
import { AssistantThreadList } from "@/features/assistant-ui/thread-list";
import { useAssistantApi } from "@assistant-ui/react";

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
 * Main navigation menu with New Chat, Workflows, Activities, and Wiki
 */
interface MainMenuProps {
  onNewChat: () => void;
  onWorkflows: () => void;
  onInsights: () => void;
  onActivities: () => void;
  onGoals: () => void;
  onWiki: () => void;
}

/**
 * Menu item configuration for main navigation.
 */
interface MenuItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  shortcutKey?: string;
  isNew?: boolean;
}

/**
 * Individual menu item component.
 */
interface MainMenuItemProps {
  config: MenuItemConfig;
  onClick: () => void;
}

const MainMenuItem: React.FC<MainMenuItemProps> = ({ config, onClick }) => {
  const { label, icon: Icon, shortcutKey, isNew } = config;
  const hasShortcut = Boolean(shortcutKey);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onClick}
        tooltip={{
          children: (
            <div className="text-center">
              <p className="font-normal">{label}</p>
              {hasShortcut ? (
                <p className="mt-1 text-xs text-white/60">
                  {getShortcutText(shortcutKey as "new-chat" | "workflows")}
                </p>
              ) : (
                <p
                  className="invisible mt-1 text-xs text-white/60"
                  aria-hidden="true"
                >
                  &nbsp;
                </p>
              )}
            </div>
          ),
        }}
        {...(isNew && {
          style: {
            backgroundColor: "var(--forest-green)",
            color: "var(--off-white)",
          },
          className: "hover:opacity-90 data-[active=true]:opacity-100",
        })}
      >
        <Icon
          className="h-4 w-4"
          {...(isNew && { strokeWidth: 2 })}
        />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const MainMenu: React.FC<MainMenuProps> = ({
  onNewChat,
  onWorkflows,
  onInsights,
  onActivities,
  onGoals,
  onWiki,
}) => {
  const menuItems: Array<{ config: MenuItemConfig; onClick: () => void }> = [
    {
      config: {
        id: "new-chat",
        label: "New Chat",
        icon: Plus,
        shortcutKey: "new-chat",
        isNew: true,
      },
      onClick: onNewChat,
    },
    {
      config: {
        id: "workflows",
        label: "Workflows",
        icon: GitBranch,
        shortcutKey: "workflows",
      },
      onClick: onWorkflows,
    },
    {
      config: {
        id: "insights",
        label: "Insights",
        icon: Lightbulb,
      },
      onClick: onInsights,
    },
    {
      config: {
        id: "activities",
        label: "Data",
        icon: FileSpreadsheet,
      },
      onClick: onActivities,
    },
    {
      config: {
        id: "goals",
        label: "Goals",
        icon: Target,
      },
      onClick: onGoals,
    },
    {
      config: {
        id: "wiki",
        label: "Wiki",
        icon: BookOpen,
      },
      onClick: onWiki,
    },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {menuItems.map(({ config, onClick }) => (
            <MainMenuItem
              key={config.id}
              config={config}
              onClick={onClick}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

/**
 * Hook for sidebar event handlers
 */
function useSidebarHandlers(
  navigationService: ReturnType<typeof useUIContext>["navigationService"],
) {
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

  const handleWorkflowsClick = React.useCallback(() => {
    handleNavigate("workflows");
  }, [handleNavigate]);

  const handleInsightsClick = React.useCallback(() => {
    navigationService.navigateToInsights();
  }, [navigationService]);

  const handleActivitiesClick = React.useCallback(() => {
    navigationService.navigateToActivities();
  }, [navigationService]);

  const handleGoalsClick = React.useCallback(() => {
    navigationService.navigateToGoals();
  }, [navigationService]);

  const handleWikiClick = React.useCallback(() => {
    handleNavigate("wiki");
  }, [handleNavigate]);

  return {
    handleWorkflowsClick,
    handleInsightsClick,
    handleActivitiesClick,
    handleGoalsClick,
    handleWikiClick,
  };
}

export const AppSidebar = (): React.JSX.Element => {
  const assistantApi = useAssistantApi();
  const { navigationService, onNewThread } = useUIContext();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const {
    handleWorkflowsClick,
    handleInsightsClick,
    handleActivitiesClick,
    handleGoalsClick,
    handleWikiClick,
  } = useSidebarHandlers(navigationService);

  const handleNewChatClick = React.useCallback(() => {
    assistantApi.threads().switchToNewThread();
    onNewThread();
  }, [assistantApi, onNewThread]);

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
          onInsights={handleInsightsClick}
          onActivities={handleActivitiesClick}
          onGoals={handleGoalsClick}
          onWiki={handleWikiClick}
        />

        <div className="px-2">
          <SidebarSeparator className="mx-0" />
        </div>

        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupLabel>CHATS</SidebarGroupLabel>
            <SidebarGroupContent>
              <AssistantThreadList />
            </SidebarGroupContent>
          </SidebarGroup>
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
