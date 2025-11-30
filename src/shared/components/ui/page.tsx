/**
 * Page Component
 *
 * A layout wrapper that provides consistent page structure across the application.
 * Handles the outer container, scroll behavior, and background styling.
 *
 * @example
 * ```tsx
 * // Default scroll variant - page content scrolls with sticky header
 * <Page>
 *   <PageHeader title="Insights" />
 *   <PageContent>
 *     <YourPageContent />
 *   </PageContent>
 * </Page>
 *
 * // Fixed variant - for data tables with their own scrolling
 * <Page variant="fixed">
 *   <PageHeader title="Activities" sticky={false} />
 *   <PageContent variant="fixed">
 *     <DataTable />
 *   </PageContent>
 * </Page>
 * ```
 */

import { cn } from "@/shared/utils/utils";

interface PageProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Layout variant:
   * - "scroll": Page content scrolls, header is sticky (default)
   * - "fixed": Header fixed at top, content fills remaining space (for data tables)
   */
  variant?: "scroll" | "fixed";
}

export const Page = ({
  children,
  className,
  variant = "scroll",
}: PageProps): React.JSX.Element => {
  if (variant === "fixed") {
    return (
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden bg-[var(--background)]",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  // Default: scroll variant
  return (
    <div
      className={cn("flex h-full flex-col bg-[var(--background)]", className)}
    >
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};
