import React from "react";
import { motion } from "framer-motion";
import { Workflow } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { Button } from "@/shared/components/ui/button";
import type { WorkflowConfig } from "../types";
import { WorkflowCard } from "./workflow-card";
import { WorkflowCategorySection } from "./workflow-category-section";

interface WorkflowsContentProps {
  searchQuery: string;
  filteredWorkflows: WorkflowConfig[];
  workflowsByCategory: Record<string, WorkflowConfig[]>;
  totalWorkflows: number;
  setCategoryRef: (categoryName: string, el: HTMLElement | null) => void;
  onWorkflowClick: (workflowId: string) => void;
  onClearSearch: () => void;
}

export const WorkflowsContent: React.FC<WorkflowsContentProps> = ({
  searchQuery,
  filteredWorkflows,
  workflowsByCategory,
  totalWorkflows,
  setCategoryRef,
  onWorkflowClick,
  onClearSearch,
}) => {
  if (totalWorkflows === 0 && !searchQuery.trim()) {
    return (
      <EmptyState
        icon={Workflow}
        title="No workflows available"
        subtitle="Workflows will appear here once they are configured in your organization."
      />
    );
  }

  return (
    <>
      {searchQuery.trim() ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWorkflows.map((workflow, index) => (
            <WorkflowCard
              key={workflow.workflow_id}
              workflow={workflow}
              index={index}
              onWorkflowClick={onWorkflowClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(workflowsByCategory).map(
            ([categoryName, categoryWorkflows], categoryIndex) => (
              <WorkflowCategorySection
                key={categoryName}
                categoryName={categoryName}
                categoryWorkflows={categoryWorkflows}
                categoryIndex={categoryIndex}
                totalCategories={Object.entries(workflowsByCategory).length}
                setCategoryRef={setCategoryRef}
                onWorkflowClick={onWorkflowClick}
              />
            ),
          )}
        </div>
      )}

      {filteredWorkflows.length === 0 && searchQuery.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground py-12 text-center"
        >
          <p className="text-lg">
            No workflows found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <Button
            variant="ghost"
            onClick={onClearSearch}
            className="mt-4"
          >
            Clear search
          </Button>
        </motion.div>
      )}

      {filteredWorkflows.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="border-border mt-16 border-t pt-8"
        >
          <p className="text-muted-foreground text-center text-sm">
            Can&apos;t find what you&apos;re looking for? Start a new chat to
            discuss your specific needs.
          </p>
        </motion.div>
      )}
    </>
  );
};
