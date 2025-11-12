import React from "react";
import { MessageList } from "./message-list";
import { ChatFooter } from "./chat-footer";
import { AnimatedContainer } from "./main-chat-area/components/animated-container";
import { ScrollableContent } from "./main-chat-area/components/scrollable-content";
import { useChatContext } from "@/features/chat/providers/chat-provider";
import { useStreamContext } from "@/core/providers/stream";
import { EmptyState } from "@/features/chat/components/empty-state";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useUIContext } from "@/features/chat/providers/ui-provider";

const MainChatAreaComponent: React.FC = () => {
  const { firstTokenReceived, handleRegenerate } = useChatContext();
  const stream = useStreamContext();
  const { navigationService } = useUIContext();

  const messages = stream.messages;
  const hasMessages = messages && messages.length > 0;
  const isLoading = stream.isLoading;

  // Handlers for EmptyState
  const handleSuggestionClick = (text: string) => {
    // Submit the suggestion as a message
    stream.submit({ messages: [{ type: "human", content: text }] });
  };

  const handleWorkflowCategoryClick = (_category: string) => {
    // Navigate to workflows page using centralized navigation service
    // This ensures consistent URL parameter handling across the app
    navigationService.navigateToWorkflows();
  };

  // Determine what to show in the main chat area
  const messageListContent = hasMessages ? (
    <MessageList
      firstTokenReceived={firstTokenReceived}
      handleRegenerate={handleRegenerate}
    />
  ) : isLoading ? (
    // Show loading indicator when workflow is being processed
    <div className="flex h-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  ) : (
    // Show empty state only when not loading and no messages
    <EmptyState
      onSuggestionClick={handleSuggestionClick}
      onWorkflowCategoryClick={handleWorkflowCategoryClick}
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
