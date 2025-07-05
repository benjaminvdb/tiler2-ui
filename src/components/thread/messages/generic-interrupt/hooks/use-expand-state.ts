import { useState } from "react";
import { shouldTruncateContent } from "../utils/value-helpers";

export function useExpandState(
  interrupt: Record<string, any> | Record<string, any>[],
) {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = shouldTruncateContent(interrupt);
  const shouldShowExpandButton =
    shouldTruncate || (Array.isArray(interrupt) && interrupt.length > 5);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return {
    isExpanded,
    shouldShowExpandButton,
    toggleExpanded,
  };
}
