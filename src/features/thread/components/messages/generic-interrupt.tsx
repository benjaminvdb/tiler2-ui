import { motion, AnimatePresence } from "framer-motion";
import { useExpandState } from "./generic-interrupt/hooks/use-expand-state";
import { processInterruptEntries } from "./generic-interrupt/utils/data-processor";
import { InterruptHeader } from "./generic-interrupt/components/interrupt-header";
import { InterruptTable } from "./generic-interrupt/components/interrupt-table";
import { ExpandButton } from "./generic-interrupt/components/expand-button";

export const GenericInterruptView: React.FC<{
  interrupt: Record<string, any> | Record<string, any>[];
}> = ({ interrupt }) => {
  const { isExpanded, shouldShowExpandButton, toggleExpanded } =
    useExpandState(interrupt);
  const displayEntries = processInterruptEntries(interrupt, isExpanded);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <InterruptHeader />
      <motion.div
        className="min-w-full bg-gray-100"
        initial={false}
        animate={{ height: "auto" }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-3">
          <AnimatePresence
            mode="wait"
            initial={false}
          >
            <InterruptTable
              displayEntries={displayEntries}
              isExpanded={isExpanded}
            />
          </AnimatePresence>
        </div>
        {shouldShowExpandButton && (
          <ExpandButton
            isExpanded={isExpanded}
            onToggle={toggleExpanded}
          />
        )}
      </motion.div>
    </div>
  );
};
