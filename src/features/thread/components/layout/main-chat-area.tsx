import React from "react";
import { MessageList } from "./message-list";
import { ChatFooter } from "./chat-footer";
import { AnimatedContainer } from "./main-chat-area/components/animated-container";
import { ScrollableContent } from "./main-chat-area/components/scrollable-content";
import { useChatContext } from "@/features/chat/providers/chat-provider";

const MainChatAreaComponent: React.FC = () => {
  const { firstTokenReceived, handleRegenerate } = useChatContext();
  const messageListContent = (
    <MessageList
      firstTokenReceived={firstTokenReceived}
      handleRegenerate={handleRegenerate}
    />
  );

  const chatFooterContent = <ChatFooter />;

  return (
    <AnimatedContainer>
      <ScrollableContent
        content={messageListContent}
        footer={chatFooterContent}
      />
    </AnimatedContainer>
  );
};

MainChatAreaComponent.displayName = "MainChatArea";

export const MainChatArea = React.memo(MainChatAreaComponent);
