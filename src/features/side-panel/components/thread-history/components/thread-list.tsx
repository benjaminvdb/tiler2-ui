import { Button } from "@/shared/components/ui/button";
import { Thread } from "@langchain/langgraph-sdk";
import { useQueryState } from "nuqs";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { extractThreadDisplayText } from "../utils/thread-text-extractor";

interface ThreadListProps {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
}
export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  onThreadClick,
}) => {
  const [threadId, setThreadId] = useQueryState("threadId");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
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

                if (pathname === "/workflows") {
                  const params = new URLSearchParams(searchParams);
                  params.set("threadId", t.thread_id);
                  const targetUrl = `/?${params.toString()}`;
                  router.replace(targetUrl);
                } else {
                  setThreadId(t.thread_id);
                }
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
