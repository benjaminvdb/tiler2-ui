import { ToolMessage } from "@langchain/langgraph-sdk";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { isComplexValue } from "./utils";
import { ToolResultContent } from "./tool-result-content";
import type { JsonValue } from "@/shared/types";

interface ToolResultItemProps {
  message: ToolMessage;
}
export const ToolResultItem: React.FC<ToolResultItemProps> = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  let parsedContent: JsonValue = message.content as JsonValue;
  let isJsonContent = false;

  try {
    if (typeof message.content === "string") {
      parsedContent = JSON.parse(message.content);
      isJsonContent = isComplexValue(parsedContent);
    }
  } catch {
    parsedContent = message.content as JsonValue;
  }
  const contentStr = isJsonContent
    ? JSON.stringify(parsedContent, null, 2)
    : String(message.content);
  const contentLines = contentStr.split("\n");
  const shouldTruncate = contentLines.length > 4 || contentStr.length > 500;
  const displayedContent =
    shouldTruncate && !isExpanded
      ? contentStr.length > 500
        ? contentStr.slice(0, 500) + "..."
        : contentLines.slice(0, 4).join("\n") + "\n..."
      : contentStr;

  const shouldShowExpandButton =
    (shouldTruncate && !isJsonContent) ||
    (isJsonContent && Array.isArray(parsedContent) && parsedContent.length > 5);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {message.name ? (
            <h3 className="font-medium text-gray-900">
              Tool Result: ;
              <code className="rounded bg-gray-100 px-2 py-1">
                {message.name}
              </code>
            </h3>
          ) : (
            <h3 className="font-medium text-gray-900">Tool Result</h3>
          )}
          {message.tool_call_id && (
            <code className="ml-2 rounded bg-gray-100 px-2 py-1 text-sm">
              {message.tool_call_id}
            </code>
          )}
        </div>
      </div>
      <motion.div
        className="min-w-full bg-gray-100"
        initial={false}
        animate={{ height: "auto" }}
        transition={{ duration: 0.3 }}
      >
        <ToolResultContent
          parsedContent={parsedContent}
          isJsonContent={isJsonContent}
          isExpanded={isExpanded}
          displayedContent={displayedContent}
        />
        {shouldShowExpandButton && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex w-full cursor-pointer items-center justify-center border-t-[1px] border-gray-200 py-2 text-gray-500 transition-all duration-200 ease-in-out hover:bg-gray-50 hover:text-gray-600"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};
