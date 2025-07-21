import { Thread } from "@langchain/langgraph-sdk";

interface MobileHistorySheetProps {
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  isLargeScreen: boolean;
  threads: Thread[];
}

export const MobileHistorySheet: React.FC<MobileHistorySheetProps> = () => {
  // Mobile history is now integrated into the main mobile header panel
  // This separate sheet is disabled to avoid conflicts
  return null;
};
