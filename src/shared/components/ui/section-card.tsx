/**
 * Section Card
 *
 * A compound component for consistent card styling across the application.
 * Used for milestone cards, collapsible info sections, and similar UI patterns.
 *
 * Structure:
 * - SectionCard: Outer wrapper (white background, rounded, bordered)
 * - SectionCardHeader: Header area (white background, bottom border)
 * - SectionCardContent: Content area (white background, padding)
 *
 * @example
 * ```tsx
 * <SectionCard>
 *   <SectionCardHeader>
 *     <h3>Title</h3>
 *   </SectionCardHeader>
 *   <SectionCardContent>
 *     <p>Content goes here</p>
 *   </SectionCardContent>
 * </SectionCard>
 * ```
 */

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/shared/utils/utils";

/**
 * Root container for section cards.
 * Provides white background, rounded corners, and border.
 */
interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionCard = ({
  children,
  className,
}: SectionCardProps): React.JSX.Element => (
  <div
    className={cn(
      "overflow-hidden rounded-lg border border-[var(--border)] bg-white",
      className,
    )}
  >
    {children}
  </div>
);

/**
 * Header section with white background (same as content).
 * Typically contains title, icon, and optional action buttons.
 *
 * Use `asChild` to merge styles onto a child element (e.g., a button for collapsible headers).
 *
 * @example
 * ```tsx
 * // Non-interactive header
 * <SectionCardHeader>
 *   <h3>Title</h3>
 * </SectionCardHeader>
 *
 * // Clickable header (for collapsible sections)
 * <SectionCardHeader asChild>
 *   <button onClick={toggle}>Click to expand</button>
 * </SectionCardHeader>
 * ```
 */
interface SectionCardHeaderProps {
  children: React.ReactNode;
  className?: string;
  /** Merge styles onto child element instead of wrapping in a div */
  asChild?: boolean;
}

export const SectionCardHeader = ({
  children,
  className,
  asChild = false,
}: SectionCardHeaderProps): React.JSX.Element => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      className={cn("border-b border-[var(--border)] bg-white p-4", className)}
    >
      {children}
    </Comp>
  );
};

/**
 * Content area with white background (inherited from SectionCard).
 * Contains the main body content of the card.
 */
interface SectionCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionCardContent = ({
  children,
  className,
}: SectionCardContentProps): React.JSX.Element => (
  <div className={cn("p-5", className)}>{children}</div>
);
