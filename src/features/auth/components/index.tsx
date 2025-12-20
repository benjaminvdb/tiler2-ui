/**
 * Authentication UI components for user login/logout functionality.
 */

import React, { forwardRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { User, LogIn } from "lucide-react";
import { UserDropdown } from "./user-dropdown";

const LoadingAvatar = (): React.JSX.Element => {
  return (
    <Avatar className="cursor-not-allowed opacity-70">
      <AvatarFallback>
        <User className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );
};

const GuestAvatar = forwardRef<HTMLButtonElement>((props, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      className="relative h-8 w-8 rounded-full"
      {...props}
    >
      <Avatar>
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
    </Button>
  );
});

GuestAvatar.displayName = "GuestAvatar";

const GuestDropdown = (): React.JSX.Element => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GuestAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleLogin}>
          <LogIn className="mr-2 h-4 w-4" />
          <span>Login</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const AuthButtons = (): React.JSX.Element => {
  const { user, isLoading } = useAuth0();

  if (isLoading) {
    return <LoadingAvatar />;
  }
  if (user) {
    return <UserDropdown user={user} />;
  }
  return <GuestDropdown />;
};

export { SidebarUserProfile } from "./sidebar-user-profile";
