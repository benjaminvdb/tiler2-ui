import AuthButtons from "@/components/auth-buttons";
import { HistoryToggleButton } from "./history-toggle-button";

export function InitialHeader() {
  return (
    <div className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-3 p-2 pl-4">
      <div>
        <HistoryToggleButton />
      </div>
      <div className="absolute top-2 right-4 flex items-center">
        <AuthButtons />
      </div>
    </div>
  );
}
