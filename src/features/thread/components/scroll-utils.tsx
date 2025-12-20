/**
 * Auto-scroll utilities wrapping use-stick-to-bottom library.
 */

import { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowDown } from "lucide-react";
import { useStickToBottomContext } from "use-stick-to-bottom";

interface StickyToBottomContentProps {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}
export const StickyToBottomContent: React.FC<StickyToBottomContentProps> = ({
  content,
  footer,
  className,
  contentClassName,
}) => {
  const { scrollRef, contentRef } = useStickToBottomContext();
  return (
    <div
      ref={scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={className}
    >
      <div
        ref={contentRef}
        className={contentClassName}
      >
        {content}
      </div>
      {footer}
    </div>
  );
};
interface ScrollToBottomProps {
  className?: string;
}
export const ScrollToBottom: React.FC<ScrollToBottomProps> = ({
  className,
}) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleClick = () => {
    scrollToBottom();
  };

  if (isAtBottom) return null;
  return (
    <Button
      variant="outline"
      className={className}
      onClick={handleClick}
    >
      <ArrowDown className="h-4 w-4" />
      <span>Scroll to bottom</span>
    </Button>
  );
};
