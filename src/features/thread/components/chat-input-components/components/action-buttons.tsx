import { Button } from "@/shared/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { ActionButtonsProps } from "../types";

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isLoading,
  onStop,
  input,
  contentBlocks,
}) => {
  const hasContent = input.trim() || contentBlocks.length > 0;

  if (isLoading) {
    return (
      <Button
        key="stop"
        onClick={onStop}
        className="bg-forest-green hover:bg-forest-green/90 ml-auto shadow-md transition-all"
      >
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Cancel
      </Button>
    );
  }
  return (
    <Button
      type="submit"
      className="bg-forest-green hover:bg-forest-green/90 ml-auto transition-all"
      disabled={isLoading || !hasContent}
      style={{
        boxShadow: hasContent
          ? "0 2px 8px rgba(11, 61, 46, 0.15)"
          : "0 1px 2px rgba(0, 0, 0, 0.05)",
      }}
    >
      Send
    </Button>
  );
};
