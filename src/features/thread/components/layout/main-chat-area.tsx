import React, { useCallback } from "react";
import { MessageList } from "./message-list";
import { ChatFooter } from "./chat-footer";
import { AnimatedContainer } from "./main-chat-area/components/animated-container";
import { ScrollableContent } from "./main-chat-area/components/scrollable-content";
import { useChatContext } from "@/features/chat/providers/chat-provider";
import { useStreamContext } from "@/core/providers/stream";
import { LandingPage } from "@/features/chat/components/landing-page";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useUIContext } from "@/features/chat/providers/ui-provider";

const MainChatAreaComponent: React.FC = () => {
  const { firstTokenReceived, handleRegenerate } = useChatContext();
  const stream = useStreamContext();
  const { navigationService } = useUIContext();

  const messages = stream.messages;
  const hasMessages = messages && messages.length > 0;
  const isLoading = stream.isLoading;

  const handleSuggestionClick = useCallback(
    (text: string) => {
      stream.submit({ messages: [{ type: "human", content: text }] });
    },
    [stream],
  );

  const handleWorkflowCategoryClick = useCallback(
    (category: string) => {
      navigationService.navigateToWorkflows({ category });
    },
    [navigationService],
  );

  const renderMessageContent = () => {
    if (hasMessages) {
      return (
        <MessageList
          firstTokenReceived={firstTokenReceived}
          handleRegenerate={handleRegenerate}
        />
      );
    }

    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return (
      <LandingPage
        onSuggestionClick={handleSuggestionClick}
        onWorkflowCategoryClick={handleWorkflowCategoryClick}
      />
    );
  };

  const chatFooterContent = <ChatFooter />;

  return (
    <AnimatedContainer>
      <ScrollableContent
        content={renderMessageContent()}
        footer={chatFooterContent}
      />
    </AnimatedContainer>
  );
};

MainChatAreaComponent.displayName = "MainChatArea";

export const MainChatArea = React.memo(MainChatAreaComponent);
