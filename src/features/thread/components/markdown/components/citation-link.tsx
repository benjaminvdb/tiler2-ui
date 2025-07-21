import { ReactNode, FC } from "react";
import { cn } from "@/shared/utils/utils";
import { BaseComponentProps } from "./markdown-elements";

// Citation metadata interface (matching backend structure)
export interface CitationMetadata {
  refId: number;
  sourceType: 'web' | 'knowledge_base' | 'methods_base';
  title: string;
  url?: string;
  date?: string;
  filename?: string;
  author?: string;
  pageNumber?: number;
}

// Props for citation-aware link component
interface CitationLinkProps extends BaseComponentProps {
  href?: string;
  children?: ReactNode;
  citationData?: CitationMetadata;
}

// Regular expression to detect citation links [1], [2], etc. or just numbers 1, 2, etc.
const CITATION_PATTERN = /^(\[\d+\]|\d+)$/;

export const CitationLink: FC<CitationLinkProps> = ({ 
  href, 
  children, 
  className, 
  citationData,
  ...props 
}) => {
  // Check if this is a citation link (e.g., [1], [2])
  const isCitationNumber = typeof children === 'string' && CITATION_PATTERN.test(children);
  
  if (isCitationNumber) {
    // This is a citation reference - could be [1] or [1](url)
    if (href && href.startsWith('http')) {
      // Web source with URL - render with light gray background and monospace font
      return (
        <a
          href={href}
          className={cn(
            "inline-block px-1 py-0.5 mx-0.5",
            "bg-gray-100 hover:bg-gray-200", 
            "text-gray-700 hover:text-gray-900",
            "citation-comic-mono font-semibold text-xs tracking-tighter",
            "rounded border border-gray-300",
            "transition-colors cursor-pointer no-underline",
            "!text-gray-700 hover:!text-gray-900",
            className
          )}
          target="_blank"
          rel="noopener noreferrer"
          title={`Citation [${children}] - Click to view source`}
          {...props}
        >
          {children}
        </a>
      );
    } else {
      // Document source without URL - render with same styling but not clickable
      return (
        <span
          className={cn(
            "inline-block px-1 py-0.5 mx-0.5",
            "bg-gray-100 hover:bg-gray-200",
            "text-gray-700 hover:text-gray-900", 
            "citation-comic-mono font-semibold text-xs tracking-tighter",
            "rounded border border-gray-300",
            "transition-colors cursor-pointer",
            "!text-gray-700 hover:!text-gray-900",
            className
          )}
          title={`Citation [${children}] - Document reference (see References section)`}
          onClick={(e) => {
            e.preventDefault();
            // Future: Open citation modal with document details
            console.log('Document citation clicked:', children, citationData);
          }}
          {...props}
        >
          {children}
        </span>
      );
    }
  }

  // Regular link - use existing styling
  return (
    <a
      href={href}
      className={cn(
        "text-primary font-medium underline underline-offset-4",
        "hover:text-primary/80 transition-colors",
        className
      )}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  );
};