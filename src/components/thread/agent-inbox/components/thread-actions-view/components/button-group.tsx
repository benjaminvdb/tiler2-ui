import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonGroupProps } from "../types";

export function ButtonGroup({
  handleShowState,
  handleShowDescription,
  showingState,
  showingDescription,
}: ButtonGroupProps) {
  return (
    <div className="flex flex-row items-center justify-center gap-0">
      <Button
        variant="outline"
        className={cn(
          "rounded-l-md rounded-r-none border-r-[0px]",
          showingState ? "text-black" : "bg-white",
        )}
        size="sm"
        onClick={handleShowState}
      >
        State
      </Button>
      <Button
        variant="outline"
        className={cn(
          "rounded-l-none rounded-r-md border-l-[0px]",
          showingDescription ? "text-black" : "bg-white",
        )}
        size="sm"
        onClick={handleShowDescription}
      >
        Description
      </Button>
    </div>
  );
}