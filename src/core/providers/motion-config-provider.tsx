"use client";

import React from "react";
import { MotionConfig } from "framer-motion";

interface MotionConfigProviderProps {
  children: React.ReactNode;
}

/**
 * Client-side wrapper for Framer Motion's MotionConfig
 * Respects user's OS-level reduced motion preferences
 */
export const MotionConfigProvider: React.FC<MotionConfigProviderProps> = ({
  children,
}) => {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
};
