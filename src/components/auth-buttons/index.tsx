import { useUser } from "@auth0/nextjs-auth0";
import { LoadingAvatar, UserDropdown, GuestDropdown } from "./components";

export default function AuthButtons() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <LoadingAvatar />;
  }

  if (user) {
    return <UserDropdown user={user} />;
  }

  return <GuestDropdown />;
}
