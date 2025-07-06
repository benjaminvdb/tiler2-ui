import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { forwardRef } from "react";

export const GuestAvatar = forwardRef<HTMLButtonElement>((props, ref) => {
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
