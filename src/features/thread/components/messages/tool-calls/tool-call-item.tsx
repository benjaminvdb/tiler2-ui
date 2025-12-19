import {
  getToolOrDynamicToolName,
  type DynamicToolUIPart,
  type ToolUIPart,
} from "ai";
import { isComplexValue } from "./utils";
import type { JsonValue } from "@/shared/types";

interface ToolCallItemProps {
  toolPart: ToolUIPart | DynamicToolUIPart;
}

/**
 * Parse tool call arguments from serialized JSON.
 */
const parseToolCallArgs = (
  toolPart: ToolUIPart | DynamicToolUIPart,
): Record<string, JsonValue> => {
  const input = toolPart.input;
  if (input === undefined) {
    return {};
  }

  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input) as unknown;
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, JsonValue>;
      }
      return { input: parsed as JsonValue };
    } catch {
      return { input };
    }
  }

  if (typeof input === "object" && input !== null) {
    return input as Record<string, JsonValue>;
  }

  return { input: input as JsonValue };
};

export const ToolCallItem: React.FC<ToolCallItemProps> = ({ toolPart }) => {
  const args = parseToolCallArgs(toolPart);
  const hasArgs = Object.keys(args).length > 0;
  const name = getToolOrDynamicToolName(toolPart) || "Unknown Tool";

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <h3 className="font-medium text-gray-900">
          {name}
          {toolPart.toolCallId && (
            <code className="ml-2 rounded bg-gray-100 px-2 py-1 text-sm">
              {toolPart.toolCallId}
            </code>
          )}
        </h3>
      </div>
      {hasArgs ? (
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="divide-y divide-gray-200">
            {Object.entries(args).map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-900">
                  {key}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {isComplexValue(value) ? (
                    <code className="rounded bg-gray-50 px-2 py-1 font-mono text-sm break-all">
                      {JSON.stringify(value, null, 2)}
                    </code>
                  ) : (
                    String(value)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <code className="block p-3 text-sm">{"{}"}</code>
      )}
    </div>
  );
};
