/**
 * PageHeader Component
 *
 * A unified, reusable header component for all pages in the application.
 * Provides consistent styling with optional back navigation, badges, and progress bars.
 *
 * @example
 * ```tsx
 * // Simple header with title and subtitle
 * <PageHeader
 *   title="Insights"
 *   subtitle="Key findings from your conversations"
 * />
 *
 * // Header with badge
 * <PageHeader
 *   title="Goals"
 *   subtitle="Track your sustainability objectives"
 *   badge={{
 *     icon: Target,
 *     label: "5 goals",
 *     iconColor: "var(--forest-green)",
 *   }}
 * />
 *
 * // Header with back button and progress
 * <PageHeader
 *   title="Goal Title"
 *   subtitle="Goal description"
 *   backButton={{
 *     label: "Back to Goals",
 *     onClick: handleBack,
 *   }}
 *   progress={{
 *     completed: 3,
 *     total: 10,
 *     label: "3 completed • 7 remaining",
 *   }}
 * />
 * ```
 */

import { ArrowLeft, type LucideIcon } from "lucide-react";

import { cn } from "@/shared/utils/utils";
import { IconBox, type IconBoxColor } from "./icon-box";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";

interface BackButtonConfig {
  label: string;
  onClick: () => void;
  ariaLabel?: string;
}

interface BadgeConfig {
  icon: LucideIcon;
  label: string;
  iconColor?: string;
}

interface ProgressConfig {
  completed: number;
  total: number;
  label?: string;
}

export interface StatItemConfig {
  icon: LucideIcon;
  value: number;
  label: string;
  sublabel?: string;
  tooltip?: string;
  iconColor?: IconBoxColor;
}

interface PageHeaderProps {
  /** Page title (required) */
  title: string;
  /** Subtitle/description (optional) */
  subtitle?: string | undefined;
  /** Back navigation button (optional) */
  backButton?: BackButtonConfig;
  /** Icon + count badge on right side (optional) */
  badge?: BadgeConfig;
  /** Row of statistics with icons (optional) */
  stats?: StatItemConfig[];
  /** Progress bar with stats (optional) */
  progress?: ProgressConfig;
  /** Whether the header sticks to the top when scrolling. Default: true */
  sticky?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const StatItem = ({ stat }: { stat: StatItemConfig }): React.JSX.Element => {
  const content = (
    <div
      className="flex items-center gap-2"
      role="listitem"
    >
      <IconBox
        size="xs"
        color={stat.iconColor ?? "sage"}
      >
        <stat.icon
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
      </IconBox>
      <span className="text-xs text-[var(--muted-foreground)]">
        <span className="font-medium text-[var(--foreground)]">
          {stat.value}
        </span>{" "}
        {stat.label}
        {stat.sublabel && (
          <span className="ml-1 text-[var(--muted-foreground)]">
            {stat.sublabel}
          </span>
        )}
      </span>
    </div>
  );

  if (stat.tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-default">{content}</div>
        </TooltipTrigger>
        <TooltipContent>{stat.tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

const StatsRow = ({ stats }: { stats: StatItemConfig[] }): React.JSX.Element => (
  <div
    className="mt-4 flex flex-wrap gap-4 md:gap-6"
    role="list"
    aria-label="Goal statistics"
  >
    {stats.map((stat) => (
      <StatItem
        key={stat.label}
        stat={stat}
      />
    ))}
  </div>
);

const ProgressBar = ({
  progress,
}: {
  progress: ProgressConfig;
}): React.JSX.Element => {
  const percentage =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;

  return (
    <div className="mt-4 flex items-center gap-3">
      <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-[var(--sand)]">
        <div
          className="h-full rounded-full bg-[var(--forest-green)] transition-all duration-500"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={progress.completed}
          aria-valuemin={0}
          aria-valuemax={progress.total}
        />
      </div>
      {progress.label && (
        <span className="text-sm text-[var(--muted-foreground)]">
          {progress.label}
        </span>
      )}
    </div>
  );
};

export const PageHeader = ({
  title,
  subtitle,
  backButton,
  badge,
  stats,
  progress,
  sticky = true,
  className,
}: PageHeaderProps): React.JSX.Element => {
  return (
    <header
      className={cn(
        "border-border bg-card border-b px-6 py-5",
        sticky && "sticky top-0 z-50",
        className,
      )}
    >
      <div className="mx-auto max-w-5xl">
        {/* Back button */}
        {backButton && (
          <button
            type="button"
            onClick={backButton.onClick}
            aria-label={backButton.ariaLabel ?? backButton.label}
            className="mb-4 flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            {backButton.label}
          </button>
        )}

        {/* Main header row */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 text-2xl font-medium">{title}</h1>
            {subtitle && (
              <p className="leading-snug text-[var(--muted-foreground)]">
                {subtitle}
              </p>
            )}
          </div>

          {/* Badge - aligned to bottom right */}
          {badge && (
            <div className="flex shrink-0 items-center gap-2 text-sm">
              <badge.icon
                className="h-4 w-4"
                style={{ color: badge.iconColor }}
              />
              <span className="text-[var(--muted-foreground)]">
                {badge.label}
              </span>
            </div>
          )}
        </div>

        {/* Stats row */}
        {stats && stats.length > 0 && <StatsRow stats={stats} />}

        {/* Progress bar */}
        {progress && <ProgressBar progress={progress} />}
      </div>
    </header>
  );
};
