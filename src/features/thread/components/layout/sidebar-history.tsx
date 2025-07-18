import React from "react";
import { motion } from "framer-motion";
import { ThreadHistory } from "../history";
import { useUIContext } from "@/features/chat/providers/ui-provider";

const SidebarHistoryComponent: React.FC = () => {
  const { chatHistoryOpen: isOpen, isLargeScreen } = useUIContext();
  return (
    <div className="relative hidden lg:flex">
      <motion.div
        className="absolute z-20 h-full overflow-hidden border-r bg-white"
        style={{ width: 300 }}
        animate={
          isLargeScreen ? { x: isOpen ? 0 : -300 } : { x: isOpen ? 0 : -300 }
        }
        initial={{ x: -300 }}
        transition={
          isLargeScreen
            ? { type: "spring", stiffness: 300, damping: 30 }
            : { duration: 0 }
        }
      >
        <div
          className="relative h-full"
          style={{ width: 300 }}
        >
          <ThreadHistory />
        </div>
      </motion.div>
    </div>
  );
};

SidebarHistoryComponent.displayName = "SidebarHistory";

export const SidebarHistory = React.memo(SidebarHistoryComponent);
