import { useEffect, useRef, useState } from "react";

/**
 * Custom hook for smooth token-level streaming display.
 *
 * Uses requestAnimationFrame to batch incoming tokens at ~60 FPS,
 * providing smooth typewriter effect while avoiding React 19's
 * automatic batching and performance issues with flushSync.
 * Falls back to canonical text resets when updates are not append-only.
 *
 * @param incomingText - The full text content from the streaming source
 * @returns The text to display, updated at animation frame intervals
 */
export function useStreamingText(incomingText: string): string {
  const [displayedText, setDisplayedText] = useState("");
  const previousTextRef = useRef("");
  const bufferRef = useRef("");
  const rafIdRef = useRef<number | null>(null);
  const pendingResetRef = useRef(false);

  const flushBuffer = () => {
    setDisplayedText((prev) => prev + bufferRef.current);
    bufferRef.current = "";
  };

  useEffect(() => {
    if (incomingText === previousTextRef.current) return;

    const previousText = previousTextRef.current;
    const isAppendOnlyUpdate =
      incomingText.length >= previousText.length &&
      incomingText.startsWith(previousText);

    if (!isAppendOnlyUpdate) {
      // Cancel any pending animation
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      // Reset refs and render the canonical text immediately.
      previousTextRef.current = incomingText;
      bufferRef.current = "";

      if (!pendingResetRef.current) {
        pendingResetRef.current = true;
        queueMicrotask(() => {
          pendingResetRef.current = false;
          setDisplayedText(previousTextRef.current);
        });
      }
      return;
    }

    if (pendingResetRef.current) {
      previousTextRef.current = incomingText;
      return;
    }

    const newContent = incomingText.slice(previousText.length);
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

  return displayedText;
}
