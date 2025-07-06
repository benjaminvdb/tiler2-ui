import React from "react";
import { motion } from "framer-motion";
import { getMainContainerClassName } from "../utils/layout-styles";
import {
  getAnimationConfig,
  getTransitionConfig,
} from "../utils/animation-config";
import { useChatContext } from "@/providers/chat";
import { useUIContext } from "@/providers/ui";

interface AnimatedContainerProps {
  children: React.ReactNode;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
}) => {
  const { chatStarted } = useChatContext();
  const { chatHistoryOpen, isLargeScreen } = useUIContext();
  return (
    <motion.div
      className={getMainContainerClassName(chatStarted)}
      layout={isLargeScreen}
      animate={getAnimationConfig(chatHistoryOpen, isLargeScreen)}
      transition={getTransitionConfig(isLargeScreen)}
    >
      {children}
    </motion.div>
  );
};
