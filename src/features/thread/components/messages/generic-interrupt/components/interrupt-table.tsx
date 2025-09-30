import { motion } from "framer-motion";
import { isComplexValue, isUrl } from "../utils/value-helpers";

interface InterruptTableProps {
  displayEntries: [string, any][];
  isExpanded: boolean;
}
export const InterruptTable: React.FC<InterruptTableProps> = ({
  displayEntries,
  isExpanded,
}) => {
  return (
    <motion.div
      key={isExpanded ? "expanded" : "collapsed"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      style={{
        maxHeight: isExpanded ? "none" : "500px",
        overflow: "auto",
      }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <tbody className="divide-y divide-gray-200">
          {displayEntries.map(([key, value], argIdx) => (
            <tr key={argIdx}>
              <td className="px-4 py-2 text-sm font-medium whitespace-nowrap text-gray-900">
                {key}
              </td>
              <td className="px-4 py-2 text-sm text-gray-500">
                {isComplexValue(value) ? (
                  <code className="rounded bg-gray-50 px-2 py-1 font-mono text-sm">
                    {JSON.stringify(value, null, 2)}
                  </code>
                ) : isUrl(value) ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-blue-600 underline hover:text-blue-800"
                  >
                    {value}
                  </a>
                ) : (
                  String(value)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};
