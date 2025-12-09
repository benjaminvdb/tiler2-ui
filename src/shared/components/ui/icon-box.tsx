/**
 * Icon Box
 *
 * A standardized container for icons with consistent styling.
 * Used in dialog headers, feature cards, and anywhere icons need
 * a colored background treatment.
 *
 * The component automatically applies a light background (20% opacity)
 * with the full color for the icon, creating a cohesive look.
 */

import React from "react";
import { cn } from "@/shared/utils/utils";

/**
 * Available colors from the design system.
 * Each color maps to a CSS variable defined in globals.css.
 */
export type IconBoxColor =
  | "sage"
  | "forest-green"
  | "sand"
  | "muted"
  | "copper";

/**
 * Size variants for the icon box.
 * - xs: 24x24px container, for inline stats and compact UI
 * - sm: 32x32px container, suitable for inline use
 * - md: 40x40px container, default size for dialogs and cards
 * - lg: 48x48px container, for hero/feature sections
 */
type IconBoxSize = "xs" | "sm" | "md" | "lg";

interface IconBoxProps {
  /** The icon element to display */
  children: React.ReactNode;
  /** Color from the design system (default: "sage") */
  color?: IconBoxColor;
  /** Size variant (default: "md") */
  size?: IconBoxSize;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Maps color names to Tailwind classes for background and text.
 * Background uses 15% opacity, text uses full color.
 */
const colorStyles: Record<IconBoxColor, string> = {
  sage: "bg-[var(--sage)]/15 text-[var(--sage)]",
  "forest-green": "bg-[var(--forest-green)]/15 text-[var(--forest-green)]",
  sand: "bg-[var(--sand)] text-[var(--muted-foreground)]",
  muted: "bg-[var(--muted)]/15 text-[var(--muted-foreground)]",
  copper: "bg-[var(--copper)]/15 text-[var(--copper)]",
};

/**
 * Maps size names to Tailwind dimension classes.
 */
const sizeStyles: Record<IconBoxSize, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

/**
 * A container that wraps icons with consistent colored background styling.
 *
 * @example
 * ```tsx
 * // Default sage color, medium size
 * <IconBox>
 *   <Link2 className="h-5 w-5" />
 * </IconBox>
 *
 * // Forest green, large size
 * <IconBox color="forest-green" size="lg">
 *   <Lightbulb className="h-6 w-6" />
 * </IconBox>
 * ```
 */
export const IconBox = ({
  children,
  color = "sage",
  size = "md",
  className,
}: IconBoxProps): React.JSX.Element => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-center rounded-lg",
      colorStyles[color],
      sizeStyles[size],
      className,
    )}
  >
    {children}
  </div>
);
