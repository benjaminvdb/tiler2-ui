import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  getToolOrDynamicToolName,
  type DynamicToolUIPart,
  type ToolUIPart,
} from "ai";
import { isComplexValue } from "./utils";
import { ToolResultContent } from "./tool-result-content";
import type { JsonValue } from "@/shared/types";

interface ToolResultItemProps {
  toolPart: ToolUIPart | DynamicToolUIPart;
}

/**
 * Parse message content as JSON if possible
 */
const parseMessageContent = (
  content: unknown,
): { parsedContent: JsonValue; isJsonContent: boolean } => {
  let parsedContent: JsonValue = content as JsonValue;
  let isJsonContent = false;

  try {
    if (typeof content === "string") {
      parsedContent = JSON.parse(content);
      isJsonContent = isComplexValue(parsedContent);
    } else if (typeof content === "object" && content !== null) {
      parsedContent = content as JsonValue;
      isJsonContent = true;
    }
  } catch {
    parsedContent = content as JsonValue;
  }

  return { parsedContent, isJsonContent };
};

/**
 * Truncate content for display
 */
const truncateContent = (
  contentStr: string,
  isExpanded: boolean,
): { displayedContent: string; shouldTruncate: boolean } => {
  const contentLines = contentStr.split("\n");
  const shouldTruncate = contentLines.length > 4 || contentStr.length > 500;

  const displayedContent =
    shouldTruncate && !isExpanded
      ? contentStr.length > 500
        ? contentStr.slice(0, 500) + "..."
        : contentLines.slice(0, 4).join("\n") + "\n..."
      : contentStr;

  return { displayedContent, shouldTruncate };
};

/**
 * Get content string from message
 */
const getContentString = (content: unknown): string => {
  if (typeof content === "string") {
    return content;
  }
  if (content === null || content === undefined) {
    return "";
  }
  if (typeof content === "object") {
    try {
      return JSON.stringify(content, null, 2);
    } catch {
      return String(content);
    }
  }
  return String(content);
};

const getToolOutput = (
  toolPart: ToolUIPart | DynamicToolUIPart,
): { output: unknown; isError: boolean } | null => {
  if (toolPart.state === "output-available") {
    return { output: toolPart.output, isError: false };
  }
  if (toolPart.state === "output-error") {
    return { output: toolPart.errorText, isError: true };
  }
  return null;
};

const getContentForDisplay = (output: unknown) => {
  const contentString = getContentString(output);
  const { parsedContent, isJsonContent } = parseMessageContent(contentString);
  const contentStr = isJsonContent
    ? JSON.stringify(parsedContent, null, 2)
    : contentString;

  return { parsedContent, isJsonContent, contentStr };
};

const getExpandState = ({
  contentStr,
  isExpanded,
  parsedContent,
  isJsonContent,
}: {
  contentStr: string;
  isExpanded: boolean;
  parsedContent: JsonValue;
  isJsonContent: boolean;
}) => {
  const { displayedContent, shouldTruncate } = truncateContent(
    contentStr,
    isExpanded,
  );
  const shouldShowExpandButton = isJsonContent
    ? Array.isArray(parsedContent) && parsedContent.length > 5
    : shouldTruncate;

  return { displayedContent, shouldShowExpandButton };
};

const ToolResultHeader: React.FC<{
  toolName: string | null;
  isError: boolean;
  toolCallId?: string;
}> = ({ toolName, isError, toolCallId }) => {
  const label = isError ? "Tool Error" : "Tool Result";

  return (
    <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {toolName ? (
          <h3 className="font-medium text-gray-900">
            {label}:
            <code className="rounded bg-gray-100 px-2 py-1">{toolName}</code>
          </h3>
        ) : (
          <h3 className="font-medium text-gray-900">{label}</h3>
        )}
        {toolCallId ? (
          <code className="ml-2 rounded bg-gray-100 px-2 py-1 text-sm">
            {toolCallId}
          </code>
        ) : null}
      </div>
    </div>
  );
};

export const ToolResultItem: React.FC<ToolResultItemProps> = ({ toolPart }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toolName = getToolOrDynamicToolName(toolPart);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const toolOutput = getToolOutput(toolPart);
  if (!toolOutput) {
    return null;
  }

  const { parsedContent, isJsonContent, contentStr } = getContentForDisplay(
    toolOutput.output,
  );
  const { displayedContent, shouldShowExpandButton } = getExpandState({
    contentStr,
    isExpanded,
    parsedContent,
    isJsonContent,
  });

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <ToolResultHeader
        toolName={toolName}
        isError={toolOutput.isError}
        toolCallId={toolPart.toolCallId}
      />
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
            onClick={toggleExpanded}
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
