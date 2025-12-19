import type { UIMessage, ToolCall } from "@/core/providers/stream/stream-types";
import { ToolCallItem } from "./tool-call-item";
import { ToolResultItem } from "./tool-result-item";

export const ToolCalls: React.FC<{
  toolCalls: ToolCall[] | undefined;
}> = ({ toolCalls }) => {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      {toolCalls.map((tc) => (
        <ToolCallItem
          key={tc.id || tc.function?.name || "unknown"}
          toolCall={tc}
        />
      ))}
    </div>
  );
};

export const ToolResult: React.FC<{ message: UIMessage }> = ({ message }) => {
  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      <ToolResultItem message={message} />
    </div>
  );
};
