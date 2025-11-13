import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useUIContext } from "@/features/chat/providers/ui-provider";
import { SIDE_PANEL_COLLAPSED_WIDTH } from "../constants";

interface SidePanelLayoutProps {
  children: React.ReactNode;
}

const SidePanelLayoutComponent: React.FC<SidePanelLayoutProps> = ({
  children,
}) => {
  const {
    chatHistoryOpen: isOpen,
    isLargeScreen,
    sidePanelWidth,
    onSidePanelWidthChange,
  } = useUIContext();
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = sidePanelWidth;
    },
    [sidePanelWidth],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;
      onSidePanelWidthChange(newWidth);
    },
    [isResizing, onSidePanelWidthChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
    return undefined;
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const currentWidth = isOpen ? sidePanelWidth : SIDE_PANEL_COLLAPSED_WIDTH;

  return (
    <div className="relative hidden lg:flex">
      <motion.div
        className="absolute z-20 h-full overflow-hidden border-r bg-white"
        style={{ width: currentWidth }}
        animate={isLargeScreen ? { x: 0 } : { x: isOpen ? 0 : -sidePanelWidth }}
        initial={{ x: isLargeScreen ? 0 : -sidePanelWidth }}
        transition={
          isLargeScreen
            ? { type: "spring", stiffness: 300, damping: 30 }
            : { duration: 0 }
        }
      >
        <div
          className="relative flex h-full flex-col"
          style={{ width: currentWidth }}
        >
          {children}
          {isOpen && (
            <div
              className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-transparent transition-colors duration-200 hover:bg-gray-300"
              onMouseDown={handleMouseDown}
              style={{ zIndex: 30 }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

SidePanelLayoutComponent.displayName = "SidePanelLayout";

export const SidePanelLayout = React.memo(SidePanelLayoutComponent);
