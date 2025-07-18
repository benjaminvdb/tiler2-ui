import { Button } from "@/shared/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { ActionButtonsProps } from "../types";

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isLoading,
  onStop,
  input,
  contentBlocks,
}) => {
  if (isLoading) {
    return (
      <Button
        key="stop"
        onClick={onStop}
        className="ml-auto !bg-[#3DAE86] shadow-md transition-all hover:!bg-[#0f6a5f]"
      >
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Cancel
      </Button>
    );
  }
  return (
    <Button
      type="submit"
      className="ml-auto !bg-[#3DAE86] shadow-md transition-all hover:!bg-[#0f6a5f]"
      disabled={isLoading || (!input.trim() && contentBlocks.length === 0)}
    >
      Send
    </Button>
  );
};
