import React from "react";
import { motion } from "framer-motion";
import { getMainContainerClassName } from "../utils/layout-styles";
import {
  getAnimationConfig,
  getTransitionConfig,
} from "../utils/animation-config";

interface AnimatedContainerProps {
  chatStarted: boolean;
  chatHistoryOpen: boolean;
  isLargeScreen: boolean;
  children: React.ReactNode;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  chatStarted,
  chatHistoryOpen,
  isLargeScreen,
  children,
}) => {
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
