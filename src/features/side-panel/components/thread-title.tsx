"use client";

import * as React from "react";
import { useTextOverflow } from "@/shared/hooks/use-text-overflow";
import { cn } from "@/shared/utils/utils";

interface ThreadTitleProps {
  text: string;
}

/**
 * Displays a thread title with conditional fade-out effect.
 * The fade-out mask only appears when the text overflows its container.
 *
 * @param text - The thread title text to display
 */
export const ThreadTitle = ({ text }: ThreadTitleProps): React.JSX.Element => {
  const [textRef, isOverflowing] = useTextOverflow(150);

  return (
    <span
      ref={textRef}
      className={cn(
        "overflow-hidden",
        isOverflowing &&
          "mask-r-from-92% mask-r-to-100% group-hover/menu-item:mask-r-from-75% group-hover/menu-item:mask-r-to-92%",
      )}
    >
      {text}
    </span>
  );
};
