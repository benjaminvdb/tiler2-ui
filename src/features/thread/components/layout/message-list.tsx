import { v4 as uuidv4 } from "uuid";
import type { Message } from "@copilotkit/shared";
import { AssistantMessage, AssistantMessageLoading } from "../messages/ai";
import { HumanMessage } from "../messages/human/index";
import { useCopilotChat } from "@/core/providers/copilotkit";

interface MessageListProps {
  firstTokenReceived: boolean;
}

type MessageWithTags = Message & {
  tags?: string[];
};

export const MessageList: React.FC<MessageListProps> = ({
  firstTokenReceived,
}) => {
  const { messages, isLoading } = useCopilotChat();

  return (
    <>
      {messages
        .filter((m) => {
          const tags = (m as MessageWithTags).tags;
          if (Array.isArray(tags) && tags.includes("hidden")) return false;
          return true;
        })
        .map((message) =>
          message.role === "user" ? (
            <HumanMessage
              key={message.id || uuidv4()}
              message={message}
              isLoading={isLoading}
            />
          ) : (
            <AssistantMessage
              key={message.id || uuidv4()}
              message={message}
              isLoading={isLoading}
            />
          ),
        )}
      {isLoading && !firstTokenReceived && <AssistantMessageLoading />}
    </>
  );
};
