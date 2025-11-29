/**
 * Skeleton component displayed while a goal's plan is being generated.
 *
 * Mimics the goal detail layout with animated placeholders for milestones and tasks.
 */

import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * Skeleton loader for goal detail page while plan is being generated.
 *
 * Displays placeholder cards matching the milestone/task structure with
 * pulse animation and proper accessibility attributes.
 */
export const GoalGeneratingSkeleton = (): React.JSX.Element => (
  <div
    role="status"
    aria-busy="true"
    aria-live="polite"
    className="space-y-6"
  >
    <span className="sr-only">Generating your plan, please wait...</span>

    {/* Info message */}
    <div className="rounded-lg border border-[var(--border)] bg-[var(--sand)]/30 p-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        Your plan is being generated. This may take a moment...
      </p>
    </div>

    {/* Milestone skeleton cards (3 placeholder milestones) */}
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-lg border border-[var(--border)] p-5"
      >
        <div className="mb-4 flex items-start gap-3">
          <Skeleton className="mt-1.5 h-1.5 w-16" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        {/* Task skeletons */}
        <div className="space-y-3">
          {[1, 2, 3].map((j) => (
            <div
              key={j}
              className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-4"
            >
              <Skeleton className="h-7 w-28" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-full max-w-xs" />
                <Skeleton className="h-3 w-full max-w-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);
