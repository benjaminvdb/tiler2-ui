import React from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";

interface SearchHeaderProps {
  searchQuery: string;
  filteredCount: number;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  filteredCount,
  onSearchChange,
  onClearSearch,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="mb-12"
    >
      <h1
        className="mb-3 font-serif text-3xl"
        style={{ letterSpacing: "0.01em" }}
      >
        Sustainability Workflows
      </h1>
      <p className="text-muted-foreground max-w-2xl leading-relaxed">
        Select a workflow to begin. Each workflow guides you through a specific
        sustainability task with tailored intelligence and best practices.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        className="mt-8 mb-6"
      >
        <div className="relative max-w-xl">
          <LucideIcons.Search
            className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            strokeWidth={2}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search workflows..."
            className="border-border text-foreground placeholder:text-muted-foreground focus:ring-sage w-full rounded-lg border bg-white py-3 pr-10 pl-11 focus:border-transparent focus:ring-2 focus:outline-none"
            style={{
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="hover:bg-sand absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 transition-colors duration-250"
            >
              <LucideIcons.X
                className="text-muted-foreground h-4 w-4"
                strokeWidth={2}
              />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-muted-foreground mt-3 text-[13px]">
            {filteredCount} workflow{filteredCount !== 1 ? "s" : ""} found
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};
