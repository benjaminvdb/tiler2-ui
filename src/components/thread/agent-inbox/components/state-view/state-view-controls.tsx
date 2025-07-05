import { X, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StateViewControlsProps {
  expanded: boolean;
  onToggleExpanded: () => void;
  onClose: () => void;
  showExpandToggle?: boolean;
}

export function StateViewControls({
  expanded,
  onToggleExpanded,
  onClose,
  showExpandToggle = true,
}: StateViewControlsProps) {
  return (
    <div className="flex items-start justify-end gap-2">
      {showExpandToggle && (
        <Button
          onClick={onToggleExpanded}
          variant="ghost"
          className="text-gray-600"
          size="sm"
        >
          {expanded ? (
            <ChevronsUpDown className="h-4 w-4" />
          ) : (
            <ChevronsDownUp className="h-4 w-4" />
          )}
        </Button>
      )}

      <Button
        onClick={onClose}
        variant="ghost"
        className="text-gray-600"
        size="sm"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
