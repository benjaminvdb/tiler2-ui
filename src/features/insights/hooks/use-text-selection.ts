/**
 * Hook for handling text selection within AI messages.
 *
 * Detects when user selects text, calculates position for floating save button,
 * and manages selection state.
 */

import { useEffect, useRef, useState } from "react";
import { selectionToMarkdown } from "../utils/html-to-markdown";

export interface SelectionPosition {
  top: number;
  left: number;
}

export interface UseTextSelectionOptions {
  /** Callback when text is selected */
  onTextSelected?: (text: string, position: SelectionPosition) => void;
  /** Whether text selection is enabled */
  enabled?: boolean;
}

export interface UseTextSelectionReturn {
  /** Currently selected text */
  selectedText: string;
  /** Position for floating button */
  selectionPosition: SelectionPosition | null;
  /** Ref to attach to the container element */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Handler for mouseup event */
  handleMouseUp: () => void;
  /** Clear current selection */
  clearSelection: () => void;
}

/**
 * Custom hook for managing text selection within a container.
 *
 * @param options - Configuration options
 * @returns Selection state and handlers
 *
 * @example
 * const { selectedText, selectionPosition, containerRef, handleMouseUp } = useTextSelection({
 *   onTextSelected: (text, position) => console.log('Selected:', text),
 *   enabled: true
 * });
 *
 * return (
 *   <div ref={containerRef} onMouseUp={handleMouseUp}>
 *     {content}
 *     {selectedText && selectionPosition && (
 *       <FloatingButton position={selectionPosition} />
 *     )}
 *   </div>
 * );
 */
export function useTextSelection(
  options: UseTextSelectionOptions = {},
): UseTextSelectionReturn {
  const { onTextSelected, enabled = true } = options;

  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] =
    useState<SelectionPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearSelection = () => {
    setSelectedText("");
    setSelectionPosition(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleMouseUp = () => {
    if (!enabled) return;

    const selection = window.getSelection();
    const text = selectionToMarkdown(selection);

    if (text && text.length > 0) {
      setSelectedText(text);

      // Calculate position relative to container
      const range = selection?.getRangeAt(0);
      if (range && containerRef.current) {
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        const position: SelectionPosition = {
          top: rect.bottom - containerRect.top + 8,
          left: rect.left - containerRect.left,
        };

        setSelectionPosition(position);

        if (onTextSelected) {
          onTextSelected(text, position);
        }
      }
    } else {
      clearSelection();
    }
  };

  // Close selection when clicking outside container
  useEffect(() => {
    if (!enabled || !selectedText) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        clearSelection();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [enabled, selectedText]);

  return {
    selectedText,
    selectionPosition,
    containerRef,
    handleMouseUp,
    clearSelection,
  };
}
