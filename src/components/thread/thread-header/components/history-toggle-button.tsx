import { Button } from "@/components/ui/button";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { useUIContext } from "@/providers/ui";

export function HistoryToggleButton() {
  const { chatHistoryOpen, isLargeScreen, onToggleChatHistory } = useUIContext();
  const shouldShow = !chatHistoryOpen || !isLargeScreen;

  if (!shouldShow) {
    return null;
  }

  return (
    <Button
      className="hover:bg-gray-100"
      variant="ghost"
      onClick={onToggleChatHistory}
    >
      {chatHistoryOpen ? (
        <PanelRightOpen className="size-5" />
      ) : (
        <PanelRightClose className="size-5" />
      )}
    </Button>
  );
}
