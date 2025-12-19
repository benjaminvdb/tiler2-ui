import type { DynamicToolUIPart, ToolUIPart } from "ai";
import { ToolCallItem } from "./tool-call-item";
import { ToolResultItem } from "./tool-result-item";

type ToolPart = ToolUIPart | DynamicToolUIPart;

const TOOL_STATE_PRIORITY: Record<string, number> = {
  "output-available": 3,
  "output-error": 3,
  "input-available": 2,
  "input-streaming": 1,
};

const normalizeToolParts = (parts: ToolPart[]): ToolPart[] => {
  const order: string[] = [];
  const byId = new Map<string, ToolPart>();

  for (const part of parts) {
    const existing = byId.get(part.toolCallId);
    if (!existing) {
      order.push(part.toolCallId);
      byId.set(part.toolCallId, part);
      continue;
    }

    const nextPriority = TOOL_STATE_PRIORITY[part.state] ?? 0;
    const currentPriority = TOOL_STATE_PRIORITY[existing.state] ?? 0;
    if (nextPriority >= currentPriority) {
      byId.set(part.toolCallId, part);
    }
  }

  return order
    .map((id) => byId.get(id))
    .filter((part): part is ToolPart => Boolean(part));
};

const hasToolOutput = (part: ToolPart): boolean =>
  part.state === "output-available" || part.state === "output-error";

export const ToolCalls: React.FC<{ toolParts: ToolPart[] }> = ({
  toolParts,
}) => {
  if (!toolParts || toolParts.length === 0) return null;

  const normalizedParts = normalizeToolParts(toolParts);

  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      {normalizedParts.map((part) => (
        <div
          key={part.toolCallId}
          className="grid gap-2"
        >
          <ToolCallItem toolPart={part} />
          {hasToolOutput(part) && <ToolResultItem toolPart={part} />}
        </div>
      ))}
    </div>
  );
};
