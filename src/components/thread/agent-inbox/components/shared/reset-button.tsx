import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";

interface ResetButtonProps {
  handleReset: () => void;
}

export function ResetButton({ handleReset }: ResetButtonProps) {
  return (
    <Button
      onClick={handleReset}
      variant="ghost"
      className="flex items-center justify-center gap-2 text-gray-500 hover:text-red-500"
    >
      <Undo2 className="h-4 w-4" />
      <span>Reset</span>
    </Button>
  );
}