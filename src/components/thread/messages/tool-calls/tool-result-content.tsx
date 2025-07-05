import { motion, AnimatePresence } from "framer-motion";
import { isComplexValue } from "./utils";

interface ToolResultContentProps {
  parsedContent: any;
  isJsonContent: boolean;
  isExpanded: boolean;
  displayedContent: string;
}

export function ToolResultContent({
  parsedContent,
  isJsonContent,
  isExpanded,
  displayedContent,
}: ToolResultContentProps) {
  return (
    <div className="p-3">
      <AnimatePresence
        mode="wait"
        initial={false}
      >
        <motion.div
          key={isExpanded ? "expanded" : "collapsed"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {isJsonContent ? (
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                {(Array.isArray(parsedContent)
                  ? isExpanded
                    ? parsedContent
                    : parsedContent.slice(0, 5)
                  : Object.entries(parsedContent)
                ).map((item, argIdx) => {
                  const [key, value] = Array.isArray(parsedContent)
                    ? [argIdx, item]
                    : [item[0], item[1]];
                  return (
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
                  );
                })}
              </tbody>
            </table>
          ) : (
            <code className="block text-sm">{displayedContent}</code>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
