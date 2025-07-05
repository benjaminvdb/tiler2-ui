import { Button } from "@/components/ui/button";
import { ActionButtonsProps } from "../types";

export function ActionButtons({
  onResolve,
  onIgnore,
  ignoreAllowed,
  actionsDisabled,
}: ActionButtonsProps) {
  return (
    <div className="flex w-full flex-row items-center justify-start gap-2">
      <Button
        variant="outline"
        className="border-gray-500 bg-white font-normal text-gray-800"
        onClick={onResolve}
        disabled={actionsDisabled}
      >
        Mark as Resolved
      </Button>
      {ignoreAllowed && (
        <Button
          variant="outline"
          className="border-gray-500 bg-white font-normal text-gray-800"
          onClick={onIgnore}
          disabled={actionsDisabled}
        >
          Ignore
        </Button>
      )}
    </div>
  );
}
