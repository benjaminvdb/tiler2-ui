"use client";

import React from "react";
import { Button } from "@/shared/components/ui/button";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { LinkLogoSVG } from "@/shared/components/icons/link";
import { useUIContext } from "@/features/chat/providers/ui-provider";

export const SidePanelBrandHeader: React.FC = () => {
  const { chatHistoryOpen, onToggleChatHistory, onNewThread } = useUIContext();

  return (
    <div className="flex w-full items-center justify-between px-4 py-3 border-b border-slate-200">
      <button
        className="flex cursor-pointer items-center gap-2 min-w-0 flex-1"
        onClick={onNewThread}
      >
        <LinkLogoSVG width={24} height={24} />
        <span className="text-lg font-semibold tracking-tight truncate">Link Chat</span>
      </button>
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