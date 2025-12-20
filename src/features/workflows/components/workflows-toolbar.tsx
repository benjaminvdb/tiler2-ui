/**
 * WorkflowsToolbar Component
 *
 * Contains the search input and category navigation for the workflows page.
 * Separated from the header to maintain consistent page structure.
 */

import React from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

interface WorkflowsToolbarProps {
  searchQuery: string;
  filteredCount: number;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

export const WorkflowsToolbar = ({
  searchQuery,
  filteredCount,
  onSearchChange,
  onClearSearch,
}: WorkflowsToolbarProps): React.JSX.Element => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="mb-8"
    >
      <div className="relative max-w-xl">
        <Search
          className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
          strokeWidth={2}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search workflows..."
          className="w-full rounded-lg border border-[var(--border)] bg-white py-3 pr-10 pl-11 text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-transparent focus:ring-2 focus:ring-[var(--sage)] focus:outline-none"
          style={{
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 transition-colors duration-250 hover:bg-[var(--sand)]"
          >
            <X
              className="h-4 w-4 text-[var(--muted-foreground)]"
              strokeWidth={2}
            />
          </button>
        )}
      </div>
      {searchQuery && (
        <p className="mt-3 text-[13px] text-[var(--muted-foreground)]">
          {filteredCount} workflow{filteredCount !== 1 ? "s" : ""} found
        </p>
      )}
    </motion.div>
  );
};
