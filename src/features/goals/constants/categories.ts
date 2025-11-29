/**
 * Goal Categories, Example Goals, and Plan Sizes
 *
 * Category data matches workflow_categories table in database.
 * Colors and icons should match the database values.
 */

import type { GoalCategory, PlanSize } from "../types";

// =============================================================================
// Category Definitions
// =============================================================================

export interface CategoryDefinition {
  id: GoalCategory;
  name: string;
  color: string;
  icon: string;
}

/**
 * Goal categories matching workflow_categories table.
 * Order matches order_index from database.
 */
export const GOAL_CATEGORIES: readonly CategoryDefinition[] = [
  {
    id: "strategy",
    name: "Strategy",
    color: "#767C91",
    icon: "map",
  },
  {
    id: "policies-governance",
    name: "Policies & Governance",
    color: "#7ca2b7",
    icon: "shield",
  },
  {
    id: "impacts-risk",
    name: "Impacts & Risk Assessment",
    color: "#72a6a6",
    icon: "target",
  },
  {
    id: "interventions",
    name: "Interventions",
    color: "#a6c887",
    icon: "lightbulb",
  },
  {
    id: "standards-reporting",
    name: "Standards & Reporting",
    color: "#d3a95d",
    icon: "book-check",
  },
  {
    id: "stakeholder-engagement",
    name: "Stakeholder Engagement",
    color: "#909095",
    icon: "users",
  },
  {
    id: "knowledge-guidance",
    name: "Knowledge & Guidance",
    color: "#878879",
    icon: "book-open",
  },
] as const;

// =============================================================================
// Example Goals
// =============================================================================

export interface ExampleGoal {
  title: string;
  description: string;
  icon: string;
  suggestedCategory: GoalCategory;
}

/**
 * Example goals shown in Step 1 of the wizard.
 * Users can click these to populate the title field.
 */
export const EXAMPLE_GOALS: readonly ExampleGoal[] = [
  {
    title: "Develop a Nature Strategy",
    description:
      "Create a comprehensive biodiversity and nature-positive strategy aligned with TNFD",
    icon: "leaf",
    suggestedCategory: "strategy",
  },
  {
    title: "Draft Environmental Policy",
    description:
      "Create an environmental policy covering climate, water, waste, and biodiversity",
    icon: "clipboard",
    suggestedCategory: "policies-governance",
  },
  {
    title: "Prepare B Corp Certification",
    description:
      "Work through B Corp Impact Assessment requirements and gather necessary documentation",
    icon: "check-square",
    suggestedCategory: "standards-reporting",
  },
  {
    title: "Conduct Materiality Assessment",
    description:
      "Identify and prioritize key sustainability topics relevant to stakeholders",
    icon: "target",
    suggestedCategory: "impacts-risk",
  },
  {
    title: "Design Circular Product Line",
    description: "Redesign product portfolio using circular economy principles",
    icon: "lightbulb",
    suggestedCategory: "interventions",
  },
  {
    title: "Plan Stakeholder Summit",
    description:
      "Organize an engagement event with key sustainability stakeholders",
    icon: "users",
    suggestedCategory: "stakeholder-engagement",
  },
] as const;

// =============================================================================
// Plan Sizes
// =============================================================================

export interface PlanSizeDefinition {
  id: PlanSize;
  name: string;
  taskRange: string;
  minTasks: number;
  maxTasks: number;
  icon: string;
}

/**
 * Plan size options for goal template generation.
 * Task counts determine how many tasks are generated.
 */
export const PLAN_SIZES: readonly PlanSizeDefinition[] = [
  {
    id: "light",
    name: "Light",
    taskRange: "2-4 tasks",
    minTasks: 2,
    maxTasks: 4,
    icon: "sprout",
  },
  {
    id: "moderate",
    name: "Moderate",
    taskRange: "6-10 tasks",
    minTasks: 6,
    maxTasks: 10,
    icon: "tree-deciduous",
  },
  {
    id: "comprehensive",
    name: "Comprehensive",
    taskRange: "10-15 tasks",
    minTasks: 10,
    maxTasks: 15,
    icon: "trees",
  },
] as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get category definition by ID.
 */
export const getCategoryById = (
  id: GoalCategory,
): CategoryDefinition | undefined => {
  return GOAL_CATEGORIES.find((cat) => cat.id === id);
};
