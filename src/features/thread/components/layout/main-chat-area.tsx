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
import { ThreadNotFound } from "../thread-not-found";
import { isThreadNotFoundError } from "../../utils/error-utils";

const MainChatAreaComponent: React.FC = () => {
  const { firstTokenReceived } = useChatContext();
  const stream = useStreamContext();
  const { navigationService } = useUIContext();

  const messages = stream.messages;
  const hasMessages = messages && messages.length > 0;
  const isLoading = stream.isLoading;
  const error = stream.error;

  const handleSuggestionClick = useCallback(
    (text: string) => {
      stream.sendMessage({ text });
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
    // Handle thread not found errors (404)
    if (error && isThreadNotFoundError(error)) {
      return <ThreadNotFound error={error} />;
    }

    if (hasMessages) {
      return <MessageList firstTokenReceived={firstTokenReceived} />;
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

  // Don't show footer if thread not found
  const showFooter = !(error && isThreadNotFoundError(error));

  return (
    <AnimatedContainer>
      <ScrollableContent
        content={renderMessageContent()}
        footer={showFooter ? chatFooterContent : null}
      />
    </AnimatedContainer>
  );
};

MainChatAreaComponent.displayName = "MainChatArea";

export const MainChatArea = React.memo(MainChatAreaComponent);
