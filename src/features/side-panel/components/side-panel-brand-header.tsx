"use client";

import React from "react";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { LinkLogoSVG } from "@/shared/components/icons/link";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { NavigationButton } from "./navigation-button";

export const SidePanelBrandHeader: React.FC = () => {
  const { chatHistoryOpen, onToggleChatHistory, onNewThread } = useUIContext();

  return (
    <div
      className="flex w-full items-center justify-between border-b border-slate-200 py-3"
      style={{ padding: chatHistoryOpen ? "12px 16px" : "12px 8px" }}
    >
      {chatHistoryOpen ? (
        <>
          <button
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
            onClick={onNewThread}
          >
            <LinkLogoSVG
              width={24}
              height={24}
            />
            <span className="truncate text-lg font-semibold tracking-tight">
              Link Chat
            </span>
          </button>
          <div className="flex-shrink-0">
            <NavigationButton
              icon={PanelRightOpen}
              label="Collapse"
              isActive={false}
              onClick={onToggleChatHistory}
              isCollapsed={false}
            />
          </div>
        </>
      ) : (
        <div className="flex w-full justify-center">
          <NavigationButton
            icon={PanelRightClose}
            label="Expand"
            isActive={false}
            onClick={onToggleChatHistory}
            isCollapsed={true}
          />
        </div>
      )}
    </div>
  );
};
