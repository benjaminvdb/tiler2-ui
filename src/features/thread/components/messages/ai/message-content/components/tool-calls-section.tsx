import { ToolCalls } from "../../../tool-calls";
import type { DynamicToolUIPart, ToolUIPart } from "ai";

interface ToolCallsSectionProps {
  hideToolCalls: boolean;
  hasToolCalls: boolean;
  toolParts: Array<ToolUIPart | DynamicToolUIPart>;
}
export const ToolCallsSection: React.FC<ToolCallsSectionProps> = ({
  hideToolCalls,
  hasToolCalls,
  toolParts,
}) => {
  if (hideToolCalls) {
    return null;
  }
  return <>{hasToolCalls && <ToolCalls toolParts={toolParts} />}</>;
};
