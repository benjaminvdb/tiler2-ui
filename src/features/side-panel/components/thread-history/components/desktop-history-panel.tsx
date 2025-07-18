import { Thread } from "@langchain/langgraph-sdk";
import { ThreadList } from "./thread-list";
import { ThreadHistoryLoading } from "./thread-history-loading";

interface DesktopHistoryPanelProps {
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  threads: Thread[];
  threadsLoading: boolean;
}
export const DesktopHistoryPanel: React.FC<DesktopHistoryPanelProps> = ({
  threads,
  threadsLoading,
}) => {
  return (
    <div className="hidden h-full w-full flex-col items-start justify-start gap-6 px-4 lg:flex">
      {threadsLoading ? (
        <ThreadHistoryLoading />
      ) : (
        <ThreadList threads={threads} />
      )}
    </div>
  );
};
