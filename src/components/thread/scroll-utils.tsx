import { ReactNode } from "react";
import { Button } from "../ui/button";
import { ArrowDown } from "lucide-react";
import { useStickToBottomContext } from "use-stick-to-bottom";

interface StickyToBottomContentProps {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function StickyToBottomContent({
  content,
  footer,
  className,
  contentClassName,
}: StickyToBottomContentProps) {
  const context = useStickToBottomContext();
  return (
    <div
      ref={context.scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={className}
    >
      <div
        ref={context.contentRef}
        className={contentClassName}
      >
        {content}
      </div>
      {footer}
    </div>
  );
}

interface ScrollToBottomProps {
  className?: string;
}

export function ScrollToBottom({ className }: ScrollToBottomProps) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="h-4 w-4" />
      <span>Scroll to bottom</span>
    </Button>
  );
}
