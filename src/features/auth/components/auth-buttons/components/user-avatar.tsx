import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { getInitials } from "../utils/get-initials";
import { forwardRef } from "react";

interface UserAvatarProps {
  user: {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  };
}
export const UserAvatar = forwardRef<
  HTMLButtonElement,
  UserAvatarProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ user, ...props }, ref) => {
  const initials = getInitials(user.name || user.email || "User");
  const userImage = user.picture || "";

  return (
    <Button
      ref={ref}
      variant="ghost"
      className="relative h-8 w-8 rounded-full"
      {...props}
    >
      <Avatar>
        <AvatarImage
          src={userImage}
          alt={user.name || "User"}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </Button>
  );
});

UserAvatar.displayName = "UserAvatar";
