import { AIMessage, ToolMessage } from "@langchain/langgraph-sdk";
import { ToolCallItem } from "./tool-call-item";
import { ToolResultItem } from "./tool-result-item";

export function ToolCalls({
  toolCalls,
}: {
  toolCalls: AIMessage["tool_calls"];
}) {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      {toolCalls.map((tc, idx) => (
        <ToolCallItem key={idx} toolCall={tc} />
      ))}
    </div>
  );
}

export function ToolResult({ message }: { message: ToolMessage }) {
  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      <ToolResultItem message={message} />
    </div>
  );
}