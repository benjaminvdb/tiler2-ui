import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export function GuestAvatar() {
  return (
    <Button
      variant="ghost"
      className="relative h-8 w-8 rounded-full"
    >
      <Avatar>
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
    </Button>
  );
}
