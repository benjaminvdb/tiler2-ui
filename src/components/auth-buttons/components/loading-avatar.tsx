import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

export function LoadingAvatar() {
  return (
    <Avatar className="cursor-not-allowed opacity-70">
      <AvatarFallback>
        <User className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );
}
