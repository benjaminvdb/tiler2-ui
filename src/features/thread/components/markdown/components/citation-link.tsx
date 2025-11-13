import { ReactNode, FC, MouseEvent } from "react";
import { cn } from "@/shared/utils/utils";
import { BaseComponentProps } from "./markdown-elements";

export interface Source {
  id: string;
  type: "web" | "knowledge_base" | "methods_base" | "csrd_reports";
  title: string;
  url?: string;
  filename?: string;
  page_number?: number;
}

interface CitationLinkProps extends BaseComponentProps {
  href?: string;
  children?: ReactNode;
}

const CITATION_PATTERN = /^(\[\d+\]|\d+)$/;
const CITATION_CLASSES = cn(
  "mx-0.5 inline-block px-1 py-0.5",
  "bg-gray-100 hover:bg-gray-200",
  "text-gray-700 hover:text-gray-900",
  "citation-comic-mono text-xs font-semibold tracking-tighter",
  "rounded border border-gray-300",
  "cursor-pointer transition-colors",
  "!text-gray-700 hover:!text-gray-900",
);

const isExternalLink = (href?: string) => Boolean(href && href.startsWith("http"));

const scrollToSources = (event: MouseEvent<HTMLSpanElement>) => {
  event.preventDefault();
  const sourcesSection = document.getElementById("sources-section");
  sourcesSection?.scrollIntoView({ behavior: "smooth" });
};

const renderCitationBadge = ({
  children,
  className,
  title,
  props,
}: {
  children: ReactNode;
  className: string | undefined;
  title: string;
  props: Partial<CitationLinkProps> & React.HTMLAttributes<HTMLSpanElement>;
}) => (
  <span
    className={cn(CITATION_CLASSES, className)}
    title={title}
    {...props}
  >
    {children}
  </span>
);

const renderExternalCitation = (
  href: string,
  children: ReactNode,
  className?: string,
  props?: Partial<CitationLinkProps>,
) => (
  <a
    href={href}
    className={cn(CITATION_CLASSES, "no-underline", className)}
    target="_blank"
    rel="noopener noreferrer"
    title={`Citation [${children}] - Click to view source`}
    {...props}
  >
    {children}
  </a>
);

export const CitationLink: FC<CitationLinkProps> = ({
  href,
  children,
  className,
  ...props
}) => {
  const isCitationNumber =
    typeof children === "string" && CITATION_PATTERN.test(children);

  if (isCitationNumber && href && isExternalLink(href)) {
    return renderExternalCitation(href, children, className, props);
  }

  if (isCitationNumber) {
    return renderCitationBadge({
      children,
      className,
      title: `Citation [${children}] - Document reference (see Sources section)`,
      props: { ...props, onClick: scrollToSources },
    });
  }

  return (
    <a
      href={href}
      className={cn(
        "text-primary font-medium underline underline-offset-4",
        "hover:text-primary/80 transition-colors",
        className,
      )}
      target={isExternalLink(href) ? "_blank" : undefined}
      rel={isExternalLink(href) ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
};
