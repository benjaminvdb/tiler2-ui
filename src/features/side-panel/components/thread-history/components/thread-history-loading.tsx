import { Skeleton } from "@/shared/components/ui/skeleton";

// Generate stable IDs for skeleton items
const SKELETON_IDS = Array.from({ length: 30 }, (_, i) => `skeleton-${i}`);

export const ThreadHistoryLoading: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {SKELETON_IDS.map((id) => (
        <Skeleton
          key={id}
          className="h-10 w-[280px]"
        />
      ))}
    </div>
  );
};
