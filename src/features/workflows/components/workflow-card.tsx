import React from "react";
import { motion } from "framer-motion";
import type { WorkflowConfig } from "../types";
import {
  getCategoryColor,
  getCategoryIllustration,
} from "../constants/category-styles";
import { getWorkflowIcon } from "../utils/workflow-icons";

interface WorkflowCardProps {
  workflow: WorkflowConfig;
  index: number;
  onWorkflowClick: (workflowId: string) => void;
}

export const WorkflowCard = ({
  workflow,
  index,
  onWorkflowClick,
}: WorkflowCardProps): React.JSX.Element => {
  const categoryColor = getCategoryColor(workflow.category.name);
  const illustrationSrc = getCategoryIllustration(workflow.category.name);

  const handleClick = () => {
    onWorkflowClick(workflow.workflow_id);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -1, transition: { duration: 0.2 } }}
      onClick={handleClick}
      className="group border-border relative w-full overflow-hidden rounded-lg border bg-white text-left transition-all duration-250 hover:border-transparent"
      style={{
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)",
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        minHeight: "280px",
      }}
    >
      {illustrationSrc && (
        <img
          src={illustrationSrc}
          alt=""
          className="pointer-events-none absolute right-0 bottom-0 h-48 w-48 object-contain"
          style={{
            opacity: 0.15,
            transform: "translate(20%, 20%) scale(1.4)",
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
        style={{
          boxShadow: `0 12px 40px ${categoryColor}20`,
        }}
      />

      <div className="relative z-10 flex h-full flex-col px-7 pt-7 pb-8">
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1"
            style={{
              backgroundColor: categoryColor,
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span className="flex h-3 w-3 items-center justify-center text-white">
              {getWorkflowIcon(workflow.category.icon_name)}
            </span>
            <span className="text-[11px] font-normal tracking-wider text-white uppercase">
              {workflow.category.name}
            </span>
          </div>
        </div>
        <h4
          className="text-foreground group-hover:text-foreground mb-4 font-serif transition-colors duration-250"
          style={{
            letterSpacing: "-0.01em",
            lineHeight: "1.4",
            fontSize: "18px",
            fontWeight: 500,
          }}
        >
          {workflow.title}
        </h4>
        <p
          className="text-muted-foreground leading-relaxed"
          style={{
            lineHeight: "1.7",
            letterSpacing: "-0.003em",
            fontSize: "14px",
            opacity: 0.85,
          }}
        >
          {workflow.description}
        </p>
      </div>
    </motion.button>
  );
};

interface FallbackLinkProps {
  workflow: WorkflowConfig;
  categoryName: string;
  onNavigate: (workflowId: string) => void;
}

export const FallbackLink = ({
  workflow,
  categoryName,
  onNavigate,
}: FallbackLinkProps): React.JSX.Element => {
  const handleClick = () => {
    onNavigate(workflow.workflow_id);
  };

  return (
    <div className="mt-5 text-center">
      <button
        type="button"
        onClick={handleClick}
        className="text-muted-foreground decoration-muted-foreground/30 hover:text-foreground hover:decoration-foreground/50 text-[14px] underline decoration-1 underline-offset-4 transition-colors duration-250"
        style={{
          letterSpacing: "-0.003em",
        }}
      >
        My option isn&apos;t here - discuss another {categoryName.toLowerCase()}{" "}
        matter
      </button>
    </div>
  );
};
