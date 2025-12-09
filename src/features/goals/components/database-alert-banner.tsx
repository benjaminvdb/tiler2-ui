/**
 * Database Alert Banner
 *
 * A dismissible alert banner that notifies users about temporary database issues
 * affecting access to previous conversations. Displays on the Goal Detail page
 * when there are tasks with work in progress (in_progress or done status).
 *
 * Design uses warm copper tones from the design system to communicate a
 * non-critical but important system status.
 */

import { AlertCircle, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

interface DatabaseAlertBannerProps {
  /** Callback when the banner is dismissed */
  onDismiss: () => void;
}

export const DatabaseAlertBanner = ({
  onDismiss,
}: DatabaseAlertBannerProps): React.JSX.Element => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-[var(--copper)]/30 bg-[#FEF3E7]"
    >
      <div className="mx-auto max-w-5xl px-6 py-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="mt-0.5 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--copper)]/20">
              <AlertCircle
                className="h-5 w-5 text-[var(--copper)]"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <h3 className="mb-1.5 text-base text-[#8B4513]">
              Previous conversations temporarily unavailable
            </h3>
            <p className="text-sm leading-relaxed text-[#6B4423]">
              We&apos;re experiencing a technical issue with our database. You
              won&apos;t be able to continue in-progress tasks or access
              summaries from completed work until this is resolved. We&apos;re
              working to restore full access as quickly as possible.
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="border-[var(--copper)]/30 text-[#8B4513] hover:bg-[var(--copper)]/10"
            >
              I understand
            </Button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-md p-2 text-[#8B4513] transition-colors hover:bg-[var(--copper)]/10"
              aria-label="Close alert"
            >
              <X
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
