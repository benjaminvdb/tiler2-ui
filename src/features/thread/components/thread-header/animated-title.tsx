/**
 * Animated title component with typewriter effect
 * Displays thread titles with smooth typing animation
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import Typewriter from "typewriter-effect";

interface AnimatedTitleProps {
  /**
   * The title to display
   */
  title: string;

  /**
   * Whether to animate the title change
   * @default true
   */
  animate?: boolean;

  /**
   * Typing speed in milliseconds per character
   * @default 50
   */
  typingSpeed?: number;

  /**
   * Delete speed in milliseconds per character
   * @default 30
   */
  deleteSpeed?: number;

  /**
   * Whether the title is currently being generated
   */
  isGenerating?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Animated title component with typewriter effect
 * Deletes the old title and types the new one when title changes
 *
 * @example
 * ```tsx
 * <AnimatedTitle
 *   title="Environmental Impact Analysis"
 *   isGenerating={false}
 *   animate={true}
 * />
 * ```
 */
export const AnimatedTitle = ({
  title,
  animate = true,
  typingSpeed = 50,
  deleteSpeed = 30,
  isGenerating = false,
  className = "",
}: AnimatedTitleProps): React.JSX.Element => {
  const [key, setKey] = useState(0);
  const previousTitleRef = useRef<string | null>(null);
  const [displayTitle, setDisplayTitle] = useState(title);

  // Detect title changes and trigger re-render with new key
  useEffect(() => {
    if (previousTitleRef.current !== null && previousTitleRef.current !== title) {
      setKey((prev) => prev + 1);
      setDisplayTitle(title);
    } else if (previousTitleRef.current === null) {
      setDisplayTitle(title);
    }
    previousTitleRef.current = title;
  }, [title]);

  // Don't render if no title
  if (!title) {
    return <></>;
  }

  // Static display (no animation needed)
  if (!animate) {
    return (
      <div className={`text-sm font-medium text-gray-900 ${className}`}>
        {title}
      </div>
    );
  }

  // Animated display with typewriter effect
  return (
    <div className={`text-sm font-medium text-gray-900 ${className}`}>
      <Typewriter
        key={key}
        onInit={(typewriter) => {
          // If there was a previous title, delete it first
          if (previousTitleRef.current && key > 0) {
            typewriter
              .pauseFor(200)
              .deleteAll(deleteSpeed)
              .pauseFor(100)
              .typeString(displayTitle)
              .start();
          } else {
            // First title - just type it
            typewriter.typeString(displayTitle).start();
          }
        }}
        options={{
          delay: typingSpeed,
          cursor: "",
        }}
      />
      {isGenerating && (
        <span className="ml-1 animate-pulse text-gray-400">...</span>
      )}
    </div>
  );
};
