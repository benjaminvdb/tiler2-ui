import { ReactNode, FC } from "react";
import { cn } from "@/shared/utils/utils";
import { BaseComponentProps } from "./markdown-elements";

// Source interface matching backend structure
// Note: Filenames for library sources are already in MLA format,
// so we don't need separate metadata fields
export interface Source {
  id: string;  // Changed from number to string - format: ref-[a-z0-9]{7}
  type: "web" | "knowledge_base" | "methods_base" | "csrd_reports";
  title: string;
  url?: string;
  filename?: string;
  page_number?: number;
}

// Props for citation-aware link component
interface CitationLinkProps extends BaseComponentProps {
  href?: string;
  children?: ReactNode;
}

// Regular expression to detect citation links [1], [2], etc. or just numbers 1, 2, etc.
const CITATION_PATTERN = /^(\[\d+\]|\d+)$/;

export const CitationLink: FC<CitationLinkProps> = ({
  href,
  children,
  className,
  ...props
}) => {
  // Check if this is a citation link (e.g., [1], [2])
  const isCitationNumber =
    typeof children === "string" && CITATION_PATTERN.test(children);

  if (isCitationNumber) {
    // This is a citation reference - could be [1] or [1](url)
    if (href && href.startsWith("http")) {
      // Web source with URL - render with light gray background and monospace font
      return (
        <a
          href={href}
          className={cn(
            "mx-0.5 inline-block px-1 py-0.5",
            "bg-gray-100 hover:bg-gray-200",
            "text-gray-700 hover:text-gray-900",
            "citation-comic-mono text-xs font-semibold tracking-tighter",
            "rounded border border-gray-300",
            "cursor-pointer no-underline transition-colors",
            "!text-gray-700 hover:!text-gray-900",
            className,
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
            "mx-0.5 inline-block px-1 py-0.5",
            "bg-gray-100 hover:bg-gray-200",
            "text-gray-700 hover:text-gray-900",
            "citation-comic-mono text-xs font-semibold tracking-tighter",
            "rounded border border-gray-300",
            "cursor-pointer transition-colors",
            "!text-gray-700 hover:!text-gray-900",
            className,
          )}
          title={`Citation [${children}] - Document reference (see Sources section)`}
          onClick={(e) => {
            e.preventDefault();
            // Scroll to sources section
            const sourcesSection = document.getElementById("sources-section");
            if (sourcesSection) {
              sourcesSection.scrollIntoView({ behavior: "smooth" });
            }
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
        className,
      )}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
};
