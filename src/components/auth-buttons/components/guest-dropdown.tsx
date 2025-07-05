import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn } from "lucide-react";
import { GuestAvatar } from "./guest-avatar";

export function GuestDropdown() {
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
}
