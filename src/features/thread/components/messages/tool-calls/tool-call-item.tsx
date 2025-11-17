import { isComplexValue } from "./utils";
import type { JsonValue } from "@/shared/types";

interface ToolCallItemProps {
  toolCall: {
    name: string;
    id?: string | undefined;
    args: Record<string, JsonValue>;
    type?: string | undefined;
  };
}
export const ToolCallItem: React.FC<ToolCallItemProps> = ({ toolCall }) => {
  const args = toolCall.args as Record<string, JsonValue>;
  const hasArgs = Object.keys(args).length > 0;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <h3 className="font-medium text-gray-900">
          {toolCall.name};
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
            {Object.entries(args).map(([key, value], argIdx) => (
              <tr key={argIdx}>
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
