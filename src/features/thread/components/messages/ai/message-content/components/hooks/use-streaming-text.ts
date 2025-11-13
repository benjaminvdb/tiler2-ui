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

  const flushBuffer = () => {
    setDisplayedText((prev) => prev + bufferRef.current);
    bufferRef.current = "";
  };

  useEffect(() => {
    if (incomingText === previousTextRef.current) return;

    const newContent = incomingText.slice(previousTextRef.current.length);
    previousTextRef.current = incomingText;
    bufferRef.current += newContent;

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        flushBuffer();
        rafIdRef.current = null;
      });
    }
  }, [incomingText]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (bufferRef.current) {
        flushBuffer();
      }
    };
  }, []);

  useEffect(() => {
    if (incomingText.length < displayedText.length) {
      setDisplayedText(incomingText);
      previousTextRef.current = incomingText;
      bufferRef.current = "";
    }
  }, [incomingText, displayedText.length]);

  return displayedText;
}
