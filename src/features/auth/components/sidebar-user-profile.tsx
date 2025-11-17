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

const LoadingProfile = () => (
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

const GuestProfile = ({ isCollapsed }: { isCollapsed: boolean }) => (
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

/**
 * Get user display information
 */
function getUserDisplayInfo(user: { name?: string; email?: string; picture?: string }) {
  const displayName = user.name || user.email || "User";
  const initials = getInitials(displayName);
  const showSecondaryEmail = Boolean(user.name && user.email && user.name !== user.email);

  return { displayName, initials, showSecondaryEmail };
}

/**
 * Authenticated user profile component
 */
interface AuthenticatedProfileProps {
  user: { name?: string; email?: string; picture?: string };
  isCollapsed: boolean;
}

const AuthenticatedProfile: React.FC<AuthenticatedProfileProps> = ({
  user,
  isCollapsed,
}) => {
  const { displayName, initials, showSecondaryEmail } = getUserDisplayInfo(user);

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
                    <AvatarImage src={user.picture} alt={displayName} />
                  )}
                  <AvatarFallback className="bg-sage/20 text-sage text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{displayName}</span>
                <ChevronDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="min-w-56">
              <DropdownMenuLabel className="truncate">
                {displayName}
              </DropdownMenuLabel>
              {showSecondaryEmail && (
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

export const SidebarUserProfile = (): React.JSX.Element => {
  const { user, isLoading } = useAuth0();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isLoading) {
    return <LoadingProfile />;
  }

  if (!user) {
    return <GuestProfile isCollapsed={isCollapsed} />;
  }

  return <AuthenticatedProfile user={user} isCollapsed={isCollapsed} />;
};
