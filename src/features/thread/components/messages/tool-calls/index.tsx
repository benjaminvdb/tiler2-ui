import { AIMessage, ToolMessage } from "@langchain/langgraph-sdk";
import { ToolCallItem } from "./tool-call-item";
import { ToolResultItem } from "./tool-result-item";

export const ToolCalls: React.FC<{
  toolCalls: AIMessage["tool_calls"];
}> = ({ toolCalls }) => {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      {toolCalls.map((tc) => (
        <ToolCallItem
          key={tc.id || tc.name}
          toolCall={tc}
        />
      ))}
    </div>
  );
};
export const ToolResult: React.FC<{ message: ToolMessage }> = ({ message }) => {
  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      <ToolResultItem message={message} />
    </div>
  );
};
