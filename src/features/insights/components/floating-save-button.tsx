import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import type { SelectionPosition } from "../hooks/use-text-selection";

export interface FloatingSaveButtonProps {
  position: SelectionPosition;
  saved?: boolean;
  onSave: () => void;
  disabled?: boolean;
}

export const FloatingSaveButton = ({
  position,
  saved = false,
  onSave,
  disabled = false,
}: FloatingSaveButtonProps): React.JSX.Element => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="absolute z-10"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {saved ? (
        <div className="flex items-center gap-1.5 rounded-md bg-[var(--sage)] px-3 py-1.5 text-white shadow-lg">
          <Lightbulb className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="text-[13px] whitespace-nowrap">Saved!</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSave}
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-md bg-[var(--forest-green)] px-3 py-1.5 text-white shadow-lg transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Lightbulb className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="text-[13px] whitespace-nowrap">
            {disabled ? "Saving..." : "Save Insight"}
          </span>
        </button>
      )}
    </motion.div>
  );
};
