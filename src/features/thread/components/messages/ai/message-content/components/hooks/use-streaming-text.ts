import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for smooth token-level streaming display.
 *
 * Uses requestAnimationFrame to batch incoming tokens at ~60 FPS,
 * providing smooth typewriter effect while avoiding React 19's
 * automatic batching and performance issues with flushSync.
 *
 * @param incomingText - The full text content from the streaming source
 * @returns The text to display, updated at animation frame intervals
 */
export function useStreamingText(incomingText: string): string {
  const [displayedText, setDisplayedText] = useState("");
  const previousTextRef = useRef("");
  const bufferRef = useRef("");
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Detect new content by comparing with previous value
    if (incomingText === previousTextRef.current) return;

    // Extract only the new content (diff)
    const newContent = incomingText.slice(previousTextRef.current.length);
    previousTextRef.current = incomingText;

    // Add new content to buffer
    bufferRef.current += newContent;

    // Schedule animation frame update if not already scheduled
    // This ensures we only render once per frame (~60 FPS)
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        // Flush buffer to displayed text
        setDisplayedText((prev) => prev + bufferRef.current);
        bufferRef.current = "";
        rafIdRef.current = null;
      });
    }
  }, [incomingText]);

  // On unmount or when incoming text resets, flush any remaining buffer
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      // Flush remaining buffer immediately on cleanup
      if (bufferRef.current) {
        setDisplayedText((prev) => prev + bufferRef.current);
        bufferRef.current = "";
      }
    };
  }, []);

  // Reset displayed text when incoming text is shorter (e.g., new message)
  useEffect(() => {
    if (incomingText.length < displayedText.length) {
      setDisplayedText(incomingText);
      previousTextRef.current = incomingText;
      bufferRef.current = "";
    }
  }, [incomingText, displayedText.length]);

  return displayedText;
}
