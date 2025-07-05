import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "../utils/get-initials";

interface UserAvatarProps {
  user: {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  };
}

export function UserAvatar({ user }: UserAvatarProps) {
  const initials = getInitials(user.name || user.email || "User");
  const userImage = user.picture || "";

  return (
    <Button
      variant="ghost"
      className="relative h-8 w-8 rounded-full"
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
}
