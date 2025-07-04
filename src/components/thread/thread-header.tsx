import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { LinkLogoSVG } from "../icons/link";
import { TooltipIconButton } from "./tooltip-icon-button";
import AuthButtons from "../AuthButtons";
import {
  PanelRightOpen,
  PanelRightClose,
  SquarePen,
} from "lucide-react";

interface ThreadHeaderProps {
  chatStarted: boolean;
  chatHistoryOpen: boolean;
  isLargeScreen: boolean;
  onToggleChatHistory: () => void;
  onNewThread: () => void;
}

export function ThreadHeader({
  chatStarted,
  chatHistoryOpen,
  isLargeScreen,
  onToggleChatHistory,
  onNewThread,
}: ThreadHeaderProps) {
  if (!chatStarted) {
    return (
      <div className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-3 p-2 pl-4">
        <div>
          {(!chatHistoryOpen || !isLargeScreen) && (
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
          )}
        </div>
        <div className="absolute top-2 right-4 flex items-center">
          <AuthButtons />
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex items-center justify-between gap-3 p-2">
      <div className="relative flex items-center justify-start gap-2">
        <div className="absolute left-0 z-10">
          {(!chatHistoryOpen || !isLargeScreen) && (
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
          )}
        </div>
        <motion.button
          className="flex cursor-pointer items-center gap-2"
          onClick={onNewThread}
          animate={{
            marginLeft: !chatHistoryOpen ? 48 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          <LinkLogoSVG width={32} height={32} />
          <span className="text-xl font-semibold tracking-tight">
            Link Chat
          </span>
        </motion.button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <AuthButtons />
        </div>
        <TooltipIconButton
          size="lg"
          className="p-4"
          tooltip="New thread"
          variant="ghost"
          onClick={onNewThread}
        >
          <SquarePen className="size-5" />
        </TooltipIconButton>
      </div>

      <div className="from-background to-background/0 absolute inset-x-0 top-full h-5 bg-gradient-to-b" />
    </div>
  );
}