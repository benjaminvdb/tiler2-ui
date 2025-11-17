import { useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { BranchSwitcherProps } from "../types";

export const BranchSwitcher: React.FC<BranchSwitcherProps> = ({
  branch,
  branchOptions,
  onSelect,
  isLoading,
}) => {
  const index = branchOptions ? branchOptions.indexOf(branch || "") : -1;

  const handlePreviousClick = useCallback(() => {
    if (!branchOptions) return;
    const prevBranch = branchOptions[index - 1];
    if (!prevBranch) return;
    onSelect(prevBranch);
  }, [branchOptions, index, onSelect]);

  const handleNextClick = useCallback(() => {
    if (!branchOptions) return;
    const nextBranch = branchOptions[index + 1];
    if (!nextBranch) return;
    onSelect(nextBranch);
  }, [branchOptions, index, onSelect]);

  if (!branchOptions || !branch) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="size-6 p-1"
        onClick={handlePreviousClick}
        disabled={isLoading}
      >
        <ChevronLeft />
      </Button>
      <span className="text-sm">
        {index + 1} / {branchOptions.length}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 p-1"
        onClick={handleNextClick}
        disabled={isLoading}
      >
        <ChevronRight />
      </Button>
    </div>
  );
};
