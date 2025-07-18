import React from "react";
import { Button } from "@/shared/components/ui/button";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { useUIContext } from "@/features/chat/providers/ui-provider";

export const SidePanelHeader: React.FC = () => {
  const { chatHistoryOpen, onToggleChatHistory } = useUIContext();

  return (
    <div className="flex w-full items-center justify-between border-b border-slate-200 px-4 pt-1.5 pb-2">
      <h1 className="text-sm font-medium tracking-tight">Chats</h1>
      <Button
        className="hover:bg-gray-100"
        variant="ghost"
        size="sm"
        onClick={onToggleChatHistory}
      >
        {chatHistoryOpen ? (
          <PanelRightOpen className="size-4" />
        ) : (
          <PanelRightClose className="size-4" />
        )}
      </Button>
    </div>
  );
};
