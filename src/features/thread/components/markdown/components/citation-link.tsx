import { ReactNode, FC, MouseEvent } from "react";
import { cn } from "@/shared/utils/utils";
import { sanitizeExternalUrl } from "@/shared/utils/url-security";
import { BaseComponentProps } from "./markdown-elements";

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

const getSafeExternalHref = (href?: string): string | null => {
  return sanitizeExternalUrl(href, {
    allowHttp: import.meta.env.MODE === "development",
  });
};

const isInternalHref = (href: string) => {
  return href.startsWith("/") || href.startsWith("#");
};

const getCitationLabel = (children: ReactNode): string | null => {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children) && children.length === 1) {
    const onlyChild = children[0];
    if (typeof onlyChild === "string" || typeof onlyChild === "number") {
      return String(onlyChild);
    }
  }

  return null;
};

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

const renderStandardLink = ({
  href,
  safeExternalHref,
  children,
  className,
  props,
}: {
  href?: string;
  safeExternalHref: string | null;
  children?: ReactNode;
  className?: string;
  props: Omit<CitationLinkProps, "href" | "children" | "className">;
}) => {
  if (!href) {
    return <span className={className}>{children}</span>;
  }

  if (!safeExternalHref && !isInternalHref(href)) {
    return <span className={className}>{children}</span>;
  }

  return (
    <a
      href={safeExternalHref || href}
      className={cn(
        "text-primary font-medium underline underline-offset-4",
        "hover:text-primary/80 transition-colors",
        className,
      )}
      target={safeExternalHref ? "_blank" : undefined}
      rel={safeExternalHref ? "noopener noreferrer" : undefined}
      {...props}
    >
      {children}
    </a>
  );
};

export const CitationLink: FC<CitationLinkProps> = ({
  href,
  children,
  className,
  ...props
}) => {
  const citationLabel = getCitationLabel(children);
  const isCitationNumber =
    citationLabel !== null && CITATION_PATTERN.test(citationLabel);
  const safeExternalHref = getSafeExternalHref(href);

  if (isCitationNumber && safeExternalHref) {
    return renderExternalCitation(
      safeExternalHref,
      citationLabel,
      className,
      props,
    );
  }

  if (isCitationNumber) {
    return renderCitationBadge({
      children: citationLabel,
      className,
      title: `Citation [${citationLabel}] - Document reference (see Sources section)`,
      props: { ...props, onClick: scrollToSources },
    });
  }

  return renderStandardLink({
    href,
    safeExternalHref,
    children,
    className,
    props,
  });
};
