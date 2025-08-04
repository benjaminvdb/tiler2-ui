import { BaseMessage } from "@langchain/core/messages";
import { ToolCall } from "@langchain/core/messages/tool";
import { MarkdownText } from "../../../markdown-text";
import { ToolCallTable } from "../tool-call-table";
import { messageTypeToLabel } from "./utils";

interface MessagesRendererProps {
  messages: BaseMessage[];
}
export const MessagesRenderer: React.FC<MessagesRendererProps> = ({
  messages,
}) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {messages
        .filter((msg) => (msg as any).type !== "system")
        .map((msg, idx) => {
          const messageTypeLabel = messageTypeToLabel(msg);
          const content =
            typeof msg.content === "string"
              ? msg.content
              : JSON.stringify(msg.content, null);
          return (
            <div
              key={msg.id ?? `message-${idx}`}
              className="ml-2 flex w-full flex-col gap-[2px]"
            >
              <p className="font-medium text-gray-700">{messageTypeLabel}:</p>
              {content && <MarkdownText>{content}</MarkdownText>}
              {"tool_calls" in msg && msg.tool_calls ? (
                <div className="flex w-full flex-col items-start gap-1">
                  {(msg.tool_calls as ToolCall[]).map((tc, idx) => (
                    <ToolCallTable
                      key={tc.id ?? `tool-call-${idx}`}
                      toolCall={tc}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
    </div>
  );
};
