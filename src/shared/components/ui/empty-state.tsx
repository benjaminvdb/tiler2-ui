/**
 * EmptyState Component
 *
 * A unified, reusable empty state component for displaying when no content exists.
 * Provides consistent styling with optional action button for direct user actions.
 *
 * @example
 * ```tsx
 * // Simple empty state
 * <EmptyState
 *   icon={Target}
 *   title="No goals created yet"
 *   subtitle="Create your first goal to get started."
 * />
 *
 * // With action button
 * <EmptyState
 *   icon={Target}
 *   title="No goals created yet"
 *   subtitle="Create your first goal to get started."
 *   action={{
 *     label: "Create goal",
 *     onClick: () => setDialogOpen(true),
 *   }}
 * />
 * ```
 */

import { type LucideIcon, Plus } from "lucide-react";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  /** Icon to display (from lucide-react) */
  icon: LucideIcon;
  /** Main title text */
  title: string;
  /** Descriptive subtitle text */
  subtitle: string;
  /** Optional action button configuration */
  action?: EmptyStateAction;
}

export const EmptyState = ({
  icon: Icon,
  title,
  subtitle,
  action,
}: EmptyStateProps): React.JSX.Element => (
  <div className="py-16 text-center">
    <Icon className="mx-auto mb-6 h-12 w-12 text-[var(--muted-foreground)]" />
    <h3 className="mb-2 text-xl">{title}</h3>
    <p className="mx-auto max-w-md text-[var(--muted-foreground)]">
      {subtitle}
    </p>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--forest-green)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--forest-green)]/90"
      >
        <Plus className="h-4 w-4" />
        {action.label}
      </button>
    )}
  </div>
);
