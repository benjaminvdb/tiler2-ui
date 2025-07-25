import { v4 as uuidv4 } from "uuid";
import { Checkpoint } from "@langchain/langgraph-sdk";
import { DO_NOT_RENDER_ID_PREFIX } from "@/features/thread/services/ensure-tool-responses";
import { AssistantMessage, AssistantMessageLoading } from "../messages/ai";
import { HumanMessage } from "../messages/human/index";
import { useStreamContext } from "@/core/providers/stream";

interface MessageListProps {
  firstTokenReceived: boolean;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}
export const MessageList: React.FC<MessageListProps> = ({
  firstTokenReceived,
  handleRegenerate,
}) => {
  const stream = useStreamContext();
  const messages = stream.messages;
  const isLoading = stream.isLoading;

  return (
    <>
      {messages
        .filter((m) => {
          if (m.id?.startsWith(DO_NOT_RENDER_ID_PREFIX)) return false;
          if (m.type === "system") return false;
          const tags = (m as any).tags;
          if (Array.isArray(tags) && tags.includes("hidden")) return false;
          return true;
        })
        .map((message, index) =>
          message.type === "human" ? (
            <HumanMessage
              key={`${message.id || uuidv4()}-${index}`}
              message={message}
              isLoading={isLoading}
            />
          ) : (
            <AssistantMessage
              key={`${message.id || uuidv4()}-${index}`}
              message={message}
              isLoading={isLoading}
              handleRegenerate={handleRegenerate}
            />
          ),
        )}
      {!!stream.interrupt && (
        <AssistantMessage
          key="interrupt-msg"
          message={undefined}
          isLoading={isLoading}
          handleRegenerate={handleRegenerate}
        />
      )}
      {isLoading && !firstTokenReceived && <AssistantMessageLoading />}
    </>
  );
};
