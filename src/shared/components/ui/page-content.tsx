/**
 * PageContent Component
 *
 * A standardized content wrapper that ensures consistent max-width and padding
 * across all pages. Supports both scrolling and fixed-height layouts.
 *
 * @example
 * ```tsx
 * // Default scroll variant - for pages with scrolling content
 * <PageContent>
 *   <YourPageContent />
 * </PageContent>
 *
 * // Fixed variant - for pages with internal scrolling (e.g., data tables)
 * <PageContent variant="fixed">
 *   <DataTable />
 * </PageContent>
 * ```
 */

import { cn } from "@/shared/utils/utils";

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Layout variant:
   * - "scroll": Content flows naturally, padding outside (default)
   * - "fixed": Fixed-height layout with padding inside, for components that handle their own scrolling
   */
  variant?: "scroll" | "fixed";
}

export const PageContent = ({
  children,
  className,
  variant = "scroll",
}: PageContentProps): React.JSX.Element => {
  // Fixed variant: Maintains height chain for data tables and other fixed-height content
  // Structure: Flex container (height chain) → Inner container (max-width + padding)
  if (variant === "fixed") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
        <div
          className={cn(
            "mx-auto flex min-h-0 max-w-5xl flex-1 flex-col",
            className,
          )}
        >
          {children}
        </div>
      </div>
    );
  }

  // Default scroll variant: Standard padding and max-width wrapper
  return (
    <div className="px-6 py-6">
      <div className={cn("mx-auto max-w-5xl", className)}>
        {children}
      </div>
    </div>
  );
};
