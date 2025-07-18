import React from "react";
import { getMainContainerClassName } from "../utils/layout-styles";
import { useChatContext } from "@/features/chat/providers/chat-provider";

interface AnimatedContainerProps {
  children: React.ReactNode;
}
export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
}) => {
  const { chatStarted } = useChatContext();
  return (
    <div className={getMainContainerClassName(chatStarted)}>{children}</div>
  );
};
