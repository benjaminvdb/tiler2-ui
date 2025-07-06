import { InitialHeader, MainHeader } from "./components";
import { useChatContext } from "@/providers/chat";

export function ThreadHeader() {
  const { chatStarted } = useChatContext();
  
  if (!chatStarted) {
    return <InitialHeader />;
  }

  return <MainHeader />;
}
