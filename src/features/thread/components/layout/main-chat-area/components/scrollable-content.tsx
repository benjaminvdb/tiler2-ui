import React from "react";
import { StickToBottom } from "use-stick-to-bottom";
import { StickyToBottomContent } from "../../../scroll-utils";
import {
  getContentClassName,
  CONTENT_CONTAINER_CLASS,
} from "../utils/layout-styles";
import { useChatContext } from "@/features/chat/providers/chat-provider";

interface ScrollableContentProps {
  content: React.ReactNode;
  footer: React.ReactNode;
}
export const ScrollableContent: React.FC<ScrollableContentProps> = ({
  content,
  footer,
}) => {
  const { chatStarted } = useChatContext();
  return (
    <StickToBottom className="relative flex-1 overflow-hidden">
      <StickyToBottomContent
        className={getContentClassName(chatStarted)}
        contentClassName={CONTENT_CONTAINER_CLASS}
        content={content}
        footer={footer}
      />
    </StickToBottom>
  );
};
