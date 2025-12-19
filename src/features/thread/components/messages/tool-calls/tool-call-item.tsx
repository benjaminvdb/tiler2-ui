import { isComplexValue } from "./utils";
import type { JsonValue } from "@/shared/types";
import type { ToolCall } from "@/core/providers/stream/ag-ui-types";

interface ToolCallItemProps {
  toolCall: ToolCall;
}

/**
 * Parse tool call arguments from AG-UI format
 */
const parseToolCallArgs = (toolCall: ToolCall): Record<string, JsonValue> => {
  try {
    if (toolCall.function?.arguments) {
      return JSON.parse(toolCall.function.arguments);
    }
  } catch {
    // Fall back to empty args
  }
  return {};
};

export const ToolCallItem: React.FC<ToolCallItemProps> = ({ toolCall }) => {
  const args = parseToolCallArgs(toolCall);
  const hasArgs = Object.keys(args).length > 0;
  const name = toolCall.function?.name || "Unknown Tool";

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <h3 className="font-medium text-gray-900">
          {name}
          {toolCall.id && (
            <code className="ml-2 rounded bg-gray-100 px-2 py-1 text-sm">
              {toolCall.id}
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
