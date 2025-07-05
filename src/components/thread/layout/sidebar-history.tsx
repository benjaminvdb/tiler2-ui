import React from "react";
import { motion } from "framer-motion";
import ThreadHistory from "../history";

interface SidebarHistoryProps {
  isOpen: boolean;
  isLargeScreen: boolean;
}

export const SidebarHistory: React.FC<SidebarHistoryProps> = ({
  isOpen,
  isLargeScreen,
}) => {
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
