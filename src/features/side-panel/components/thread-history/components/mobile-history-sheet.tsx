import { Thread } from "@langchain/langgraph-sdk";

interface MobileHistorySheetProps {
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  isLargeScreen: boolean;
  threads: Thread[];
}

/**
 * Placeholder for the legacy mobile history sheet.
 * The dedicated sheet was removed in favor of the mobile header, but the
 * component remains so callers do not break while the redesign is completed.
 */
export const MobileHistorySheet: React.FC<MobileHistorySheetProps> = () => {
  return null;
};
