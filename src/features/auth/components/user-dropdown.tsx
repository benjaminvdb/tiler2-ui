import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { UserAvatar } from "./user-avatar";

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  };
}
export const UserDropdown: React.FC<UserDropdownProps> = ({ user }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {user.name || user.email || "User"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href="/auth/logout"
            className="flex w-full cursor-pointer items-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
