import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PanelRightOpen, PanelRightClose, SquarePen } from "lucide-react";
import { LinkLogoSVG } from "@/components/icons/link";
import { AuthButtons } from "@/components/auth-buttons";
import { TooltipIconButton } from "../tooltip-icon-button";
import { useUIContext } from "@/providers/ui";
import { useChatContext } from "@/providers/chat";

function HistoryToggleButton() {
  const { chatHistoryOpen, isLargeScreen, onToggleChatHistory } =
    useUIContext();
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

function BrandLogo() {
  const { chatHistoryOpen, onNewThread } = useUIContext();
  return (
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
      <LinkLogoSVG
        width={32}
        height={32}
      />
      <span className="text-xl font-semibold tracking-tight">Link Chat</span>
    </motion.button>
  );
}

function HeaderActions() {
  const { onNewThread } = useUIContext();
  return (
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
  );
}

function MainHeader() {
  return (
    <div className="relative z-10 flex items-center justify-between gap-3 p-2">
      <div className="relative flex items-center justify-start gap-2">
        <div className="absolute left-0 z-10">
          <HistoryToggleButton />
        </div>
        <BrandLogo />
      </div>
      <HeaderActions />
      <div className="from-background to-background/0 absolute inset-x-0 top-full h-5 bg-gradient-to-b" />
    </div>
  );
}

function InitialHeader() {
  return (
    <div className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-3 p-2 pl-4">
      <div>
        <HistoryToggleButton />
      </div>
      <div className="absolute top-2 right-4 flex items-center">
        <AuthButtons />
      </div>
    </div>
  );
}

export function ThreadHeader() {
  const { chatStarted } = useChatContext();

  if (!chatStarted) {
    return <InitialHeader />;
  }

  return <MainHeader />;
}
