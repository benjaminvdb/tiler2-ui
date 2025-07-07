import React, { forwardRef } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogIn } from "lucide-react";
import { UserDropdown } from "./components";

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <GuestAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href="/auth/login"
            className="flex w-full cursor-pointer items-center"
          >
            <LogIn className="mr-2 h-4 w-4" />
            <span>Login</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const AuthButtons = (): React.JSX.Element => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <LoadingAvatar />;
  }

  if (user) {
    return <UserDropdown user={user} />;
  }

  return <GuestDropdown />;
};
