"use client";

import * as React from "react";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/shared/components/ui/avatar";
import { useAuth0 } from "@auth0/auth0-react";
import { ChevronDown, LogOut, User, LogIn } from "lucide-react";
import { getInitials } from "./utils/get-initials";

export const SidebarUserProfile = (): React.JSX.Element => {
  const { user, isLoading } = useAuth0();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Loading state
  if (isLoading) {
    return (
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-not-allowed opacity-70">
              <User className="h-4 w-4" />
              <span className="truncate">Loading...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    );
  }

  // Guest state
  if (!user) {
    return (
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton {...(isCollapsed && { tooltip: "Sign in" })}>
                  <Avatar className="size-6">
                    <AvatarFallback className="bg-sage/20">
                      <User className="text-sage h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">Guest</span>
                  <ChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="min-w-56"
              >
                <DropdownMenuItem asChild>
                  <a
                    href="/auth/login"
                    className="flex cursor-pointer items-center"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    <span>Sign in</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    );
  }

  // Authenticated user state
  const initials = getInitials(user.name || user.email || "User");
  const displayName = user.name || user.email || "User";

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                {...(isCollapsed && { tooltip: displayName })}
                className="hover:bg-sidebar-accent"
              >
                <Avatar className="size-6">
                  {user.picture && (
                    <AvatarImage
                      src={user.picture}
                      alt={displayName}
                    />
                  )}
                  <AvatarFallback className="bg-sage/20 text-sage text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{displayName}</span>
                <ChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="min-w-56"
            >
              <DropdownMenuLabel className="truncate">
                {user.name || user.email || "User"}
              </DropdownMenuLabel>
              {user.name && user.email && user.name !== user.email && (
                <DropdownMenuLabel className="text-muted-foreground truncate text-xs font-normal">
                  {user.email}
                </DropdownMenuLabel>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a
                  href="/auth/logout"
                  className="flex cursor-pointer items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};
