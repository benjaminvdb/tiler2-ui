import { v4 as uuidv4 } from "uuid";
import type { UIMessage } from "@/core/providers/stream/stream-types";
import { AssistantMessage, AssistantMessageLoading } from "../messages/ai";
import { HumanMessage } from "../messages/human/index";
import { useStreamContext } from "@/core/providers/stream";

const DO_NOT_RENDER_ID_PREFIX = "do-not-render-";

interface MessageListProps {
  firstTokenReceived: boolean;
}

type MessageWithTags = UIMessage & {
  tags?: string[];
};

export const MessageList: React.FC<MessageListProps> = ({
  firstTokenReceived,
}) => {
  const stream = useStreamContext();
  const messages = stream.messages;
  const isLoading = stream.isLoading;

  return (
    <>
      {messages
        .filter((m) => {
          if (m.id?.startsWith(DO_NOT_RENDER_ID_PREFIX)) return false;
          const tags = (m as MessageWithTags).tags;
          if (Array.isArray(tags) && tags.includes("hidden")) return false;
          return true;
        })
        .map((message) =>
          message.type === "human" ? (
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
