import { Button } from "@/shared/components/ui/button";
import { Thread } from "@langchain/langgraph-sdk";
import { useSearchParamState } from "@/core/routing/hooks";
import { extractThreadDisplayText } from "../utils/thread-text-extractor";
import { useUIContext } from "@/features/chat/providers/ui-provider";

interface ThreadListProps {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
}
export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  onThreadClick,
}) => {
  const [threadId] = useSearchParamState("threadId");
  const { navigationService } = useUIContext();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2">
      {threads.map((t) => {
        const itemText = extractThreadDisplayText(t);
        return (
          <div
            key={t.thread_id}
            className="w-full px-1"
          >
            <Button
              variant="ghost"
              className="w-full items-start justify-start text-left font-normal"
              onClick={(e) => {
                e.preventDefault();
                onThreadClick?.(t.thread_id);
                if (t.thread_id === threadId) return;

                navigationService.navigateToHome({ threadId: t.thread_id });
              }}
            >
              <p className="w-full truncate text-ellipsis">{itemText}</p>
            </Button>
          </div>
        );
      })}
    </div>
  );
};
