/**
 * Loading skeleton state for thread history list.
 */
import { Skeleton } from "@/shared/components/ui/skeleton";

// Generate stable IDs for skeleton items
const SKELETON_IDS = Array.from({ length: 30 }, (_, i) => `skeleton-${i}`);

export const ThreadHistoryLoading: React.FC = () => {
  return (
    <div className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted hover:scrollbar-thumb-accent dark:scrollbar-thumb-accent/30 dark:hover:scrollbar-thumb-accent/50 flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll">
      {SKELETON_IDS.map((id) => (
        <Skeleton
          key={id}
          className="h-10 w-[280px]"
        />
      ))}
    </div>
  );
};
