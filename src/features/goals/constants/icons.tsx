/**
 * Goal Icons
 *
 * Icon mappings for categories, plan sizes, and output formats.
 */

/* eslint-disable react-refresh/only-export-components */

import React from "react";
import {
  Leaf,
  Users,
  Target,
  Lightbulb,
  Map,
  Shield,
  BookCheck,
  BookOpen,
  ClipboardList,
  CheckSquare,
  Sprout,
  TreeDeciduous,
  Trees,
  FileText,
  Table2,
  MoreHorizontal,
} from "lucide-react";

/**
 * Icon mapping for goal-related icons.
 * Used across categories, example goals, plan sizes, and output formats.
 */
export const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  map: Map,
  shield: Shield,
  target: Target,
  lightbulb: Lightbulb,
  "book-check": BookCheck,
  users: Users,
  "book-open": BookOpen,
  leaf: Leaf,
  clipboard: ClipboardList,
  "check-square": CheckSquare,
  sprout: Sprout,
  "tree-deciduous": TreeDeciduous,
  trees: Trees,
  "file-text": FileText,
  table: Table2,
};

/**
 * Get an icon component by name with optional className.
 *
 * @param iconName - The icon name from ICON_MAP
 * @param className - Optional CSS classes to apply
 * @returns The icon element or null if not found
 */
export const getIcon = (
  iconName: string,
  className: string = "",
): React.ReactNode => {
  const Icon = ICON_MAP[iconName];
  if (!Icon) return null;
  return <Icon className={className} />;
};

/**
 * Fallback icon for unknown categories or missing icons.
 */
export const FallbackIcon = MoreHorizontal;
