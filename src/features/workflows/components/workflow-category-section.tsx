import React from "react";
import { motion } from "framer-motion";
import type { WorkflowConfig } from "../types";
import { getCategoryColor } from "../constants/category-styles";
import { getWorkflowIcon } from "../utils/workflow-icons";
import { FallbackLink, WorkflowCard } from "./workflow-card";

interface CategorySectionProps {
  categoryName: string;
  categoryWorkflows: WorkflowConfig[];
  categoryIndex: number;
  totalCategories: number;
  setCategoryRef: (categoryName: string, el: HTMLElement | null) => void;
  onWorkflowClick: (workflowId: string) => void;
}

export const WorkflowCategorySection = ({
  categoryName,
  categoryWorkflows,
  categoryIndex,
  totalCategories,
  setCategoryRef,
  onWorkflowClick,
}: CategorySectionProps): React.JSX.Element => {
  const category = categoryWorkflows[0].category;
  const categoryColor = getCategoryColor(categoryName);
  const isOnboarding = categoryName === "Onboarding";
  const isLastCategory = categoryIndex === totalCategories - 1;
  const fallbackWorkflow = categoryWorkflows.find((w) => w.order_index === 0);

  const handleRef = (el: HTMLElement | null) => {
    setCategoryRef(categoryName, el);
  };

  return (
    <motion.section
      ref={handleRef}
      data-category={categoryName}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        delay: categoryIndex * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{ scrollMarginTop: "2rem" }}
      className={`${isLastCategory ? "mb-6" : "mb-16"} pb-12 ${
        !isLastCategory
          ? `border-b ${isOnboarding ? "border-border border-b-2" : "border-gray-200"}`
          : ""
      }`}
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className={`flex items-center justify-center rounded-lg ${isOnboarding ? "h-12 w-12" : "h-10 w-10"}`}
          style={{
            backgroundColor: `${categoryColor}${isOnboarding ? "20" : "15"}`,
            boxShadow: isOnboarding
              ? `0 2px 8px ${categoryColor}15`
              : undefined,
          }}
        >
          <div
            className={`${isOnboarding ? "h-6 w-6" : "h-5 w-5"} flex items-center justify-center`}
            style={{ color: categoryColor, strokeWidth: 1.5 }}
          >
            {getWorkflowIcon(category.icon_name)}
          </div>
        </div>
        <div>
          <h2
            className="font-serif text-[24px] font-normal text-[rgb(20,32,26)]"
            style={{ letterSpacing: "0.01em" }}
          >
            {categoryName}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoryWorkflows.map((workflow, workflowIndex) => (
          <WorkflowCard
            key={workflow.workflow_id}
            workflow={workflow}
            index={workflowIndex}
            onWorkflowClick={onWorkflowClick}
          />
        ))}
      </div>
      {fallbackWorkflow && (
        <FallbackLink
          workflow={fallbackWorkflow}
          categoryName={categoryName}
          onNavigate={onWorkflowClick}
        />
      )}
    </motion.section>
  );
};
